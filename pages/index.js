import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';
import { countryList } from '../assets/countryList';
import {
  IconCircleNumber1,
  IconCircleNumber2,
  IconCircleNumber3,
  IconCircleNumber4,
} from '@tabler/icons';

const popularCountries = ['Japan', 'Italy', 'France', 'Spain', 'Thailand'];
const months = [
  'Any month',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const basePrompt = "Write me an itinerary for";
const addHotelsPrompt = "- Hotel (prefer not to change it unless traveling to another city)\n";
const addRestaurantsPrompt = "- 2 Restaurants, one for lunch and another for dinner, with shortened Google Map links\n";

const cleanOutput = (output) => {
  // Remove "output": and curly braces {}
  let cleanedText = output.replace(/"output":/g, '').replace(/[{}]/g, '');
  cleanedText = cleanedText.replace(/^"|"$/g, '');
  // Replace * and ** with whitespace
  cleanedText = cleanedText.replace(/\*\*|\*/g, ' ');

  // Replace \n with line break
  cleanedText = cleanedText.replace(/\\n/g, '\n');

  // Trim any leading or trailing whitespace
  cleanedText = cleanedText.trim();

  return cleanedText;
};

const Home = () => {
  const [duration, setDuration] = useState(5);
  const [hotels, setHotels] = useState(true);
  const [restaurants, setRestaurants] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Any month');

  const [apiOutput, setApiOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [cleanedOutput, setCleanedOutput] = useState('');
  const [structuredOutput, setStructuredOutput] = useState({});
  const [loading, setLoading] = useState(false);

  const divRef = useRef(null);

  useEffect(() => {
    setCleanedOutput(cleanOutput(apiOutput));
  }, [apiOutput]);

  const callGenerateEndpoint = async () => {
    setLoading(true);
    setIsGenerating(true);

    // Construct the prompt based on user input
    let prompt = `${basePrompt} ${duration} days to ${selectedCountry} in the coming ${selectedMonth}. Describe the weather that month, and also 5 things to take note about this country's culture. Keep to a maximum travel area to the size of Hokkaido, if possible, to minimize traveling time between cities.\n\nFor each day, list me the following:\n- Attractions suitable for that season\n`;
    if (hotels) prompt += addHotelsPrompt;
    if (restaurants) prompt += addRestaurantsPrompt;
    prompt += 'and give me a daily summary of the above points into a paragraph or two.\n';

    // Specify the format of data you want from Gemini
    prompt += 'Output the data in a structured format, including separate sections for each day with attractions, hotels, and restaurants listed.\n';
    prompt+='Format the output, use bulletpoints,newlines and tabs. To do so use html tags <h1>, <h2>, <h3>, <b>, <i>, <br><br>, <p>, <li>, <ul>, etc. to format and output in an orderly manner, give them good spacing, sepereating the days, places to visits, attractions, etc.\n'
    console.log('Calling Gemini');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      // Assuming the response contains the generated text directly
      const generatedText = await response.text();
      console.log(generatedText);
      setApiOutput(generatedText); // Set the generated text to state
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false); // Reset the loading state regardless of success or failure
      setLoading(false);
    }
  };

  return (
    <div className="root">
      <div className="flex max-[600px]:flex-col w-full">
        <div className="container-left">
          <div className="header">
            <div className="header-title">
              <h1>Know your trips 🪄</h1>
            </div>
            <div className="header-subtitle">
              <h2>
                Wanderlust provides you with best attractions and restaurants to explore!
              </h2>
            </div>
          </div>
          <div className="prompt-container">
            <div className="flex items-center">
              <IconCircleNumber1 color="rgb(110 231 183)" />
              <span className="ml-2">Where do you want to go?</span>
            </div>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="prompt-box"
            >
              <option value="">Select a country</option>
              {countryList.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <div className="areas-of-interests">
              <div
                style={{
                  color: '#fff',
                  display: 'inline-block',
                  marginRight: '.8rem',
                }}
              >
                {popularCountries.map((i) => (
                  <button
                    className={`item ${selectedCountry.includes(i) && 'selected'}`}
                    key={i}
                    onClick={() => {
                      setSelectedCountry(i)
                    }}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex w-100 mt-4">
              <div
                className="flex-none mr-6 flex-col items-start"
                style={{ display: 'flex', width: '180px' }}
              >
                <div className="flex items-center mb-2">
                  <IconCircleNumber2 color="rgb(110 231 183)" />
                  <span className="ml-2">How many days?</span>
                </div>
                <input
                  type="number"
                  className="rounded block"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{ width: '180px' }}
                />
              </div>
              <div className="ml-4">
                <div className="flex items-center mb-2">
                  <IconCircleNumber3 color="rgb(110 231 183)" />
                  <span className="ml-2">Month</span>
                </div>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="prompt-box"
                >
                  <option value="">Select a month</option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <div>
                <div className="flex items-center mb-2">
                  <IconCircleNumber4 color="rgb(110 231 183)" />
                  <span className="ml-2">Recommendations?</span>
                </div>
                <div>
                  <label className="inline-flex items-center mr-8">
                    <input
                      type="checkbox"
                      className="rounded checked:bg-blue-500"
                      value={restaurants}
                      checked={restaurants}
                      onChange={(e) => setRestaurants(e.target.checked)}
                    />
                    <span className="ml-2">🍔 Restaurants</span>
                  </label>

                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="rounded checked:bg-blue-500"
                      value={hotels}
                      onChange={(e) => setHotels(e.target.checked)}
                      checked={hotels}
                    />
                    <span className="ml-2">🏨 Hotels</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="prompt-buttons" style={{color: "red"}}>
              <button
                className="pushable py-2 px-4 rounded"
                onClick={callGenerateEndpoint}
                disabled={isGenerating}
              >
                <span className="shadow"></span>
                <span className="edge"></span>
                <div className="front">
                  {isGenerating ? (
                    <div>
                      <span className="loader mr-2"></span>
                      <span>Applying magic now...</span>
                    </div>
                  ) : (
                    <span className="font-semibold">Generate</span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="container-right" ref={divRef} style={{ backgroundColor: "#F8FAFC", color: "black" }}>
    {loading && <div>Loading...</div>}
    {/* Formatted output with dangerouslySetInnerHTML */}
    <div dangerouslySetInnerHTML={{ __html: cleanedOutput }}></div>
          </div>

      </div>
    </div>
  );
};

export default Home;
