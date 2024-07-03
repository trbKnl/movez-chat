# Movez Chat

This repository contains a chat application used by the [Movez project](https://www.eur.nl/essb/informatie-voor/onderzoekers/movez-lab/onderzoekers).
Movez Chat is a 4-player chat game where one player is an imposter. The other players must guess who the imposter is through conversation.

This game can be administered as an experiment to participants. Chat data for the game can be collected and analysed for various research goals

## Installation instructions for development

To install and run the application, follow these steps:

1. **Clone the repository**:
    ```
    git clone <repository-url>
    cd <repository-directory>
    ```

2. **Install dependencies**:
    ```
    npm install
    ```

3. **Start Redis for cache and session management**:
    ```
    docker run --rm -p 6379:6379 redis:7
    ```

4. **Start the development server**:
    ```
    npm run dev
    ```

## Joining the game 

Players can join a game using the endpoint:

```
/chat/<participant_id>
```

Replace `<participant_id>` with a unique participant id. The game will star as soon as 4 unique players have joined.


## Deployment for production

### Research cloud 

Playbooks have been provided to deploy on [Surf research cloud](https://www.surf.nl/en/services/surf-research-cloud). See the `researchcloud_deployment` folder.
In this deployment the the app runs in docker containers on a single VM with Docker compose.

### Deployment with Docker

You can run this app using docker compose. 

```
docker compose build
docker compose up
```

Data resulting from the game will be in `/var/lib/docker/`.

When running the app in production set the `DOMAIN_NAME` build argument in the `docker-compose.yaml` to your domain (`https://example-domain.com`).

