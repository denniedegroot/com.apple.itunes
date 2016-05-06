# iTunes for Homey (Testing)
This app will connect Homey with iTunes to control your music.

## Setup:
- Run `npm install` to get all required dependencies like nodeunit and rewire for unit-testing.

## Run:
- Run `npm start` to start the application locally without the Homey device.

## Unit-Testing:
- Run `npm test` to run all unit-tests in the `/test` folder using NodeUnit.

## Extra:
- Any code you want to run can be put inside **app-mock.js myTestCode()** and will execute automaticly when an iTunes session is established by pairing.
- The app will start pairing on startup by default showing up in any iTunes client unless the **paircode/host(optional)** is hardcoded in **app-mock.js** making it connect right away.


## Features:
- Pair with iTunes
- Control songs with play, pause, previous, next
- Change the volume
- Homey can say what song is playing
- Homey can say the user rating of a song
- Play a song
- Create and play a playlist of your favorite artist
- Trigger on song changed, paused, resumed
- Speech input support

## Speech:
For speech always include the word "iTunes" in your sentence.
Some examples:
- iTunes pause
- iTunes play
- iTunes previous song
- iTunes next song
- iTunes set volume to 80 percent
- iTunes what song is playing

## Licensing:
* This application is subject to [these terms](https://github.com/denniedegroot/com.apple.itunes/blob/master/LICENSE).
