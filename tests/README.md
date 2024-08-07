# Stress test

To stress test the server connect n people to the game using a script and start fake chatting.
Then start a real game and check the performance while the server is under load.

## Connect to the game

In `client.js` change `URL` appropriately.

Connect clients to the game, like so:

```
# this connects 504 people to the game
for i in {1..504}; do node client.js &; done
```

