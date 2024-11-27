pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'wanderlust'
        DOCKER_TAG = 'latest'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/your-username/your-repository.git'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .'
                }
            }
        }
        
        stage('Test Docker Image') {
            steps {
                script {
                    sh 'docker run --rm ${DOCKER_IMAGE}:${DOCKER_TAG} npm run test'
                }
            }
        }
        
        stage('Push Docker Image') {
            steps {
                script {
                    sh 'docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} your-username/${DOCKER_IMAGE}:${DOCKER_TAG}'
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                        sh 'docker push your-username/${DOCKER_IMAGE}:${DOCKER_TAG}'
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    sh 'docker run -d -p 3001:3001 ${DOCKER_IMAGE}:${DOCKER_TAG}'
                }
            }
        }
    }
    
    post {
        always {
            sh 'docker system prune -f'
        }
    }
}
