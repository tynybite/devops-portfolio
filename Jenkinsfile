pipeline {
    agent any
    
    environment {
        GITHUB_REPO = 'sn3hashis/devops-portfolio'  // Replace with your repo
        DEPLOY_DIR = '/var/www/portfolio'
        GITHUB_TOKEN = credentials('github-token')  // Add this in Jenkins credentials
        HOST = '0.0.0.0'  // Allow external connections
        PORT = '4321'     // Astro port
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
                    # Ensure deploy directory exists with correct permissions
                    sudo mkdir -p ${DEPLOY_DIR}
                    sudo chown -R nginx:nginx ${DEPLOY_DIR}
                    sudo chmod -R 755 ${DEPLOY_DIR}
                    
                    # Copy files with sudo
                    sudo rm -rf ${DEPLOY_DIR}/*
                    sudo cp -r dist/* ${DEPLOY_DIR}/
                    
                    export PATH=$PATH:/usr/local/bin
                    
                    # Stop existing PM2 process if running
                    if pm2 list | grep -q "portfolio"; then
                        pm2 delete portfolio
                    fi
                    
                    cd ${DEPLOY_DIR}
                    # Ensure PM2 can access the directory
                    sudo chown -R jenkins:jenkins ${DEPLOY_DIR}
                    
                    # Create ecosystem config
                    cat > ecosystem.config.js << 'EOL'
                    module.exports = {
                      apps: [{
                        name: 'portfolio',
                        script: 'npm',
                        args: 'start',
                        env: {
                          HOST: '0.0.0.0',
                          PORT: '4321'
                        },
                        watch: false
                      }]
                    }
                    EOL
                    
                    # Start using PM2 with ecosystem file
                    pm2 start "serve -s ${DEPLOY_DIR} -l 4321" --name portfolio

                    
                    # Save PM2 configuration
                    pm2 save
                    
                    # Reset permissions after PM2 start
                    sudo chown -R nginx:nginx ${DEPLOY_DIR}
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