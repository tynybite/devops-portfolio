pipeline {
    agent any
    
    environment {
        GITHUB_REPO = 'sn3hashis/devops-portfolio'  // Replace with your repo
        DEPLOY_DIR = '/var/www/portfolio'
        GITHUB_TOKEN = credentials('github-token')  // Add this in Jenkins credentials
    }
    
    stages {
        stage('Cleanup Workspace') {
            steps {
                cleanWs()
            }
        }
        
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: "https://github.com/${GITHUB_REPO}.git"
            }
        }
        
        stage('Download Artifacts') {
            steps {
                sh '''
                    # Create artifacts directory
                    mkdir -p dist
                    
                    # Download artifact using GitHub API
                    ARTIFACT_URL=$(curl -H "Authorization: token ${GITHUB_TOKEN}" \
                        "https://api.github.com/repos/${GITHUB_REPO}/actions/artifacts" \
                        | jq -r '.artifacts[] | select(.name=="portfolio-dist") | .archive_download_url' | head -n 1)
                    
                    if [ -z "$ARTIFACT_URL" ]; then
                        echo "Error: Could not find portfolio-dist artifact"
                        exit 1
                    fi
                    
                    # Download and extract the artifact
                    curl -L -H "Authorization: token ${GITHUB_TOKEN}" \
                        -o artifact.zip "${ARTIFACT_URL}"
                    unzip artifact.zip -d dist/
                    rm artifact.zip
                '''
            }
        }
        
        stage('Deploy') {
            steps {
                sh '''
                    # Ensure deploy directory exists
                    sudo mkdir -p ${DEPLOY_DIR}
                    sudo chown -R jenkins:jenkins ${DEPLOY_DIR}                    
                    # Copy files
                    rm -rf ${DEPLOY_DIR}/*
                    cp -r dist/* ${DEPLOY_DIR}/
                    export PATH=$PATH:/usr/local/bin
                    # Restart PM2 process if exists, or start new one
                    if pm2 list | grep -q "portfolio"; then
                        pm2 restart portfolio
                    else
                        cd ${DEPLOY_DIR}
                        pm2 start npm --name "portfolio" -- start
                    fi
                '''
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
} 