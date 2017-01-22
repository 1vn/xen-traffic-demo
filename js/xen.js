import React, { Component } from "react";
import ReactDOM from "react-dom";

import 'whatwg-fetch';

//http://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

class XenApp extends Component {
	constructor(props){
		super(props);

		this.state = {
			level: 3,
			speed: 300,
		}

		this.getLevel = this.getLevel.bind(this);
	}

	getLevel (){
		let sendDate = (new Date()).getTime();
		fetch("/xen/traffic")
			.then((response) => response.json())
				.catch((error) => {
					console.log(error)
					return {level: 1}
				})
					.then((responseJson) => {
						let receiveDate = (new Date()).getTime();
						this.setState({
							level: responseJson.level,
							speed: Math.min((receiveDate - sendDate) * 10, 500),
						})
					});
	}

	componentDidMount(){
		setInterval(this.getLevel, 10000);
	}

	render() {
		return (
			<div id={this.props.id}>
				<Traffic level={this.state.level} speed={this.state.speed}/>
			</div>
		)
	}
}

class Car extends Component {
	constructor(props) {
		super(props);
		
		let carPic = Math.round(Math.random() * 6 + 1);
		let offset = (Math.random() * 20 - 10)
		this.state = {
			left: -300,
			background: `url('/assets/img/car${carPic}.png') no-repeat 0 10px`,
			top: this.props.data.lane * 40 + 196 - offset
		};
	}
	componentDidMount(){
		setTimeout(() => {
			this.setState({
				left: Math.max(2500 - this.props.data.speed, 800),
				top: this.props.data.lane * 40 + 196,
			})
		}, 50);
	}

	render (){
		return (
				<div 
					ref={this.props.data.id} 
					style={{
						top: this.state.top,
						left: this.state.left,
						background: this.state.background,
						backgroundSize: "auto 20px"
					}} 
					className="car">
				</div>)
	}
}

class Traffic extends Component {
	constructor (props) {
		super(props);

		this.state = {
			maxRows: 5,
			maxCols: 12,
			driveInterval: {},
			cars: [],
			lastLane: 0,
		};	

		this.pickLane = this.pickLane.bind(this);
		this.driveCar = this.driveCar.bind(this);
		this.getDriveInterval = this.getDriveInterval.bind(this);
		this.collectGarage = this.collectGarage.bind(this);
	}

	pickLane () {
		let lane = Math.round(Math.random() * this.state.maxRows);
		while (lane == this.state.lastLane){
			lane = Math.round(Math.random() * this.state.maxRows);
		}
		this.setState({
			lastLane: lane
		})
		return lane;
	}

	driveCar () {
		let lane = this.pickLane();
		let carID = makeid();
		this.setState({
			cars: this.state.cars.concat([{
				id: carID,
				lane: lane, 
				speed: this.props.speed,
				expire: (new Date()).getTime() + this.props.speed + 15*1000
			}])
		})
	}

	collectGarage () {
		for(let i = 0; i < this.state.cars.length; i++){
			let c = this.state.cars[i];
			if(c && c.expire < (new Date()).getTime()){
				let currentCars = this.state.cars
				delete currentCars[i]
				this.setState({
					cars: currentCars
				});
			}
		}
	}

	componentWillReceiveProps (nextProps, nextState) {
		if(this.props.level != nextProps.level){
			clearInterval(this.state.driveInterval);
			let driveInterval = setInterval(this.driveCar, this.getDriveInterval(nextProps.level));
			this.setState({
				driveInterval: driveInterval,
			});
		}
	}

	getDriveInterval(level){
		switch(level){
			case 1:
				return 3000;
			case 2:
				return 1000;
			case 3:
				return 100;
		}

	}

	componentDidMount () {
		let driveInterval = setInterval(this.driveCar, this.getDriveInterval(this.props.level))
		this.driveCar();
		setInterval(this.collectGarage, 1000)

		this.setState({
			driveInterval: driveInterval,
		})
	}

	render () {
		return (
			<div 
				id="highway" 
				ref="highway">
				{
					this.state.cars.map((data, idx) => 
						data && <Car key={idx} data={data} />
					)
				}
			</div>
		);
	}
}

function init() {
	if(document.getElementById("react-app")){
		ReactDOM.render(
		  <XenApp id="xen-app" />, document.getElementById("react-app")
		);
	}
}

init();			