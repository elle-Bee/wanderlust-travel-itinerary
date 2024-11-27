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
  let cleanedText = output.replace(/"output":/g, '').replace(/[{}]/g, '');
  cleanedText = cleanedText.replace(/^"|"$/g, '');
  cleanedText = cleanedText.replace(/\*\*|\*/g, ' ');
  cleanedText = cleanedText.replace(/\\n/g, '\n');
  cleanedText = cleanedText.trim();
  return cleanedText;
};

const sendMetric = async (type, data) => {
  try {
    await fetch('/api/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data }),
    });
  } catch (error) {
    console.error('Error sending metric:', error);
  }
};

const recordPrometheusMetric = async (metricName, labels = {}) => {
  try {
    await fetch('/api/prometheus-metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metricName, labels }),
    });
  } catch (error) {
    console.error('Error recording Prometheus metric:', error);
  }
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
  const [loading, setLoading] = useState(false);
  const divRef = useRef(null);

  useEffect(() => {
    setCleanedOutput(cleanOutput(apiOutput));
  }, [apiOutput]);

  const callGenerateEndpoint = async () => {
    setLoading(true);
    setIsGenerating(true);
    let prompt = `${basePrompt} ${duration} days to ${selectedCountry} in the coming ${selectedMonth}. Describe the weather that month, and also 5 things to take note about this country's culture. Keep to a maximum travel area to the size of Hokkaido, if possible, to minimize traveling time between cities.\n\nFor each day, list me the following:\n- Attractions suitable for that season\n`;
    if (hotels) prompt += addHotelsPrompt;
    if (restaurants) prompt += addRestaurantsPrompt;
    prompt += 'and give me a daily summary of the above points into a paragraph or two.\n';
    prompt += 'Output the data in a structured format, including separate sections for each day with attractions, hotels, and restaurants listed.\n';
    prompt += 'Format the output, use bulletpoints,newlines and tabs. To do so use html tags <h1>, <h2>, <h3>, <b>, <i>, <br><br>, <p>, <li>, <ul>, etc. to format and output in an orderly manner, give them good spacing, separating the days, places to visit, attractions, etc.\n';

    try {
      sendMetric('generate_attempt', { selectedCountry, duration, selectedMonth });
      recordPrometheusMetric('button_press_total', { button: 'generate', success: 'false' });

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

      const generatedText = await response.text();
      setApiOutput(generatedText);
      sendMetric('generate_success', { selectedCountry, duration });
      recordPrometheusMetric('button_press_total', { button: 'generate', success: 'true' });
    } catch (error) {
      console.error('Error generating content:', error);
      sendMetric('generate_error', { error: error.message });
      recordPrometheusMetric('button_press_total', { button: 'generate', success: 'false' });
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  };

  return (
    <div className="root">
      <div className="flex max-[600px]:flex-col w-full">
        <div className="container-left">
          <div className="header">
            <div className="header-title">
              <h1>Know your trip with us. 🪄</h1>
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
                      setSelectedCountry(i);
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
          </div>
          <button
            onClick={callGenerateEndpoint}
            className="generate-button mt-4"
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
        <div
          className="container-right"
          ref={divRef}
          style={{ backgroundColor: '#F8FAFC', color: 'black' }}
        >
          {loading && <div>Loading...</div>}
          <div dangerouslySetInnerHTML={{ __html: cleanedOutput }}></div>
        </div>
      </div>
    </div>
  );
};

export default Home;
