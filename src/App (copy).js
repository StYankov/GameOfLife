import React, { Component } from 'react';

const GRID_SIZE = 25;
const INITIAL_SEED = 3;

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      grid: [],
      initialSeeds: [],
      isPaused: false,
      generations: 0,
      renderSpeed: 1000
    }

    this.renderInterval = null;
    this._grow = this._grow.bind(this);
    this.clearGame = this.clearGame.bind(this);
    this.pauseGame = this.pauseGame.bind(this);
    this.continueGame = this.continueGame.bind(this);
    this.startGame = this.startGame.bind(this);
    this.changeRenderSpeed = this.changeRenderSpeed.bind(this);
  }

  initialStart() {
    const seeds = this._generate_seed();
    const grid = this._generate_field();

    this._seed_array(grid, seeds);

    this.setState({ grid, initialSeeds: seeds });
  }

  componentWillMount() {
    /** Prepare game fild and seed map */
    this.initialStart();
  }

  componentDidMount() {
    /** Start the game aka start rendering frames */
    this._setInterval(this.state.renderSpeed);
  }

  /** Button actions */

  clearGame() {
    this._stopTimer();
    this.setState({ grid: this._generate_field(), isPaused: false, generations: 0 });
  }

  pauseGame() {
    this._stopTimer();
    this.setState({ isPaused: true });
  }

  continueGame() {
    this.setState({ isPaused: false }); // Probably causing useless rerender
    this._setInterval(this.state.render);
  }

  startGame() {
    this.initialStart();
    this._setInterval(this.state.renderSpeed);
  }

  changeRenderSpeed(ms){
    this._stopTimer();
    this.setState({ renderSpeed: ms }, () => this._setInterval(this.state.renderSpeed));
  }

  _setInterval(ms) {
    this.renderInterval = setInterval(() => this._grow(), ms);
  }

  _stopTimer(){
    clearInterval(this.renderInterval);
    this.renderInterval = null;
  }

  _grow() {
    const grid = this.state.grid;
    const newGrid = this._generate_field();
    let newGenerations = 0;

    for(let y = 0; y < GRID_SIZE; y++) {
      for(let x = 0; x < GRID_SIZE; x++) {
        const neighbours = this._count_neighbours(x,y);
        // Cell Respawn
        if(neighbours === 3 && grid[y][x] === 0) {
          newGrid[y][x] = 1;
          newGenerations++;
        }

        if(neighbours < 2) {
          newGrid[y][x] = 0;
        } else if (neighbours <= 3) { // Cell survives
          newGrid[y][x] = 1;
        } else newGrid[y][x] = 0;
      }
    }

    this.setState({ grid: newGrid, generations: this.state.generations + newGenerations });
  }

  _count_neighbours(x,y) {
    let neighbours = 0;
    const grid = this.state.grid;
    // left 
    if(x > 0 && grid[y][x-1] === 1) neighbours++;
    // left-top
    if(x > 0 && y > 0 && grid[y-1][x-1] === 1) neighbours++;
    // top
    if(y > 0 && grid[y-1][x]) neighbours++;
    // top-right
    if(x < GRID_SIZE - 1 && y > 0 && grid[y-1][x + 1] === 1) neighbours++;
    // right
    if(x < GRID_SIZE - 1 && grid[y][x + 1] === 1) neighbours++;
    // bottom-right
    if(x < GRID_SIZE - 1 && y < GRID_SIZE - 1 && grid[y + 1][x + 1] === 1) neighbours++;
    // bottom
    if(y < GRID_SIZE - 1 && grid[y + 1][x] === 1) neighbours++;
    // bottom-left
    if(x > 0 && y < GRID_SIZE - 1 && grid[y + 1][x - 1]) neighbours++;

    return neighbours;
  }

  _seed_array(grid, seeds) {
    for(const coords of seeds) {
      const {x, y} = coords;
      grid[y][x] = 1;
    }
  }

  // [min,max) incluse/exclusive
  _randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  _generate_seed() {
    const coordinates = [];
    
    for(let i = 0; i < INITIAL_SEED; i++) {
      const x = this._randomNumber(0, GRID_SIZE);
      const y = this._randomNumber(0, GRID_SIZE);
      coordinates.push({ x, y });

      this._generate_neighbours(x,y).map(item => coordinates.push(item));
    }

    return coordinates;
  }

  _generate_neighbours(x,y){
    const adjecent = [];
    const AJDECENT_TO_GENERATE = 2;

    for(let i = 0; i < AJDECENT_TO_GENERATE; i++) {
      const moveX = this._randomNumber(-1, 2);
      const moveY = this._randomNumber(-1, 2);

      const newX = x + moveX >= 0 && x + moveX < GRID_SIZE ? x + moveX : x;
      const newY = y + moveY >= 0 && y + moveY < GRID_SIZE ? y + moveY : y;

      adjecent.push({ x: newX, y: newY });
    }

    return adjecent;
  }

  _generate_field() {
    const grid = new Array(GRID_SIZE);
    for(let i = 0; i < GRID_SIZE; i++) {
      grid[i] = new Array(GRID_SIZE).fill(0);
    }

    return grid;
  }

  _renderTableRow(totalColumns, y) {
    const columns = [];

    for(let col = 0; col < totalColumns; col++) {
      let classes = '', grid = this.state.grid;
      
      if(grid[y][col] === 1)
        classes = 'populated';

      columns.push(<td className={classes} key={y + col}></td>);
    }

    return (<tr key={y}>{columns}</tr>);
  }

  render() {
    const tableRows = [];

    for(let i = 0; i < GRID_SIZE; i++) {
      tableRows.push(this._renderTableRow(GRID_SIZE, i));
    }

    return (
      <div className="container">
        <div className="controls ctrl">
          <button onClick={this.startGame} disabled={this.renderInterval === null ? false : true} >Старт</button>
          <button onClick={this.state.isPaused ? this.continueGame : this.pauseGame} disabled={!this.renderInterval && !this.state.isPaused} >{this.state.isPaused ? 'Продължи' : 'Пауза'}</button>
          <button onClick={this.clearGame}>Изчисти</button>
          <span>Общо новопоявили се: {this.state.generations}</span>
        </div>
        <table id="table">
          <tbody>
            {tableRows}
          </tbody>
        </table>
        <div className="bottom-controls ctrl">
          <div className="speed">
            <span className="label">
              Скорост:
            </span>
            <button onClick={() => this.changeRenderSpeed(1000)} disabled={this.state.renderSpeed === 1000}>
              Бавно (1000ms)
            </button>
            <button onClick={() => this.changeRenderSpeed(500)} disabled={this.state.renderSpeed === 500}>
              Средно (500ms)
            </button>
            <button onClick={() => this.changeRenderSpeed(250)} disabled={this.state.renderSpeed === 250}>
              Бързо (250ms)
            </button>
          </div>
          <div className="map-size">
            <span className="label">
              Размер на карта:
            </span>
            <button>
              25x25
            </button>
            <button>
              35x35
            </button>
            <button>
              50x50
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
