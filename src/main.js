require('es6-symbol/implement');
import GameState from "./GameState"
import TitleState from "./TitleState"
import LevelState from "./LevelState"
import GameOverState from "./GameOverState"
import ControlsState from "./ControlsState"
import AboutState from "./AboutState"
import Engine from "./Engine"

requestAnimationFrame(function(timestamp) {
  window.scrollTo(0,1);
  let engine = new Engine(960, 640, timestamp);

  let gameStates = {};
  gameStates.titleState = new TitleState(engine);
  gameStates.levelState = new LevelState(engine);
  gameStates.gameOverState = new GameOverState(engine);
  gameStates.controlsState = new ControlsState(engine);
  gameStates.aboutState = new AboutState(engine);
  engine.gameStates = gameStates;

  engine.setState("titleState");
  engine.start();
});
