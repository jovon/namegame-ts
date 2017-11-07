import * as React from 'react';
import './Game.css';

// Selects a random integer between 0 and the maximum index of the items array
function getRandomInt (min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

interface NameProps {
    value: Answer;
}

function Name(props: NameProps) {
    let fName = '';
    let lName = '';
    if (props.value.item) {
        fName = props.value.item.firstName;
        lName = props.value.item.lastName;
    }
    return(
        <h2 id="name" className="well">
            {fName + ' ' + lName}
        </h2>
    );
}

interface Headshot {
    type: string; 
    mimeType: string;
    id: string;
    url: string;
    alt: string;
    height: number;
    width: number;
}

interface Staff {
    id: string;
    type: string;
    slug: string;
    jobTitle: string;
    firstName: string; 
    lastName: string; 
    headshot: Headshot;
    socialLinks: string[];
}

interface FaceProps {
    value: Staff[];
    index: number;
    disabled: boolean;
    onClick(): void;
}

class Face extends React.Component<FaceProps> {
    constructor(props: FaceProps) {
        super();
    }
    render() {
        var imgLocation = this.props.value[0] !== undefined ? this.props.value[0].headshot.url : '';
        return(
            <button 
                    className="face" 
                    id={this.props.index.toString()} 
                    onClick={() => this.props.onClick()} 
                    disabled={this.props.disabled}
            >
                <img src={imgLocation} />
            </button>
        );
    }
}

function Next(props: FaceProps) {
    return(
        <button id="next" type="button" className="btn btn-primary btn-lg" onClick={() => props.onClick()}>
            Next
        </button>
    );
}

interface FacesProps {
    value: Staff[];
    onClick(i: number): void;
}

class Faces extends React.Component<FacesProps> {
    constructor(props: FacesProps) {
        super();
    }
    renderFace(i: number) {
        return (
                <Face 
                    value={[this.props.value[i]]} 
                    index={i} 
                    onClick={() => this.props.onClick(i)} 
                    disabled={false}
                />
        );
    }
    render() {
        return (
            <div className="faces">
                {this.renderFace(0)}
                {this.renderFace(1)}
                {this.renderFace(2)}
                {this.renderFace(3)}
                {this.renderFace(4)}
            </div>
        );
    }
}

interface State {
    history: {
        right: number;
        wrong: number;
    };
    data: Staff[];
    choices: Staff[];
    maxIndex: number;
    correctlyAnswered: boolean;
    disabled: boolean;
    answer: Answer; 
}

interface Answer {
    index: number;
    item: Staff;
}

interface GameProps {}

class Game extends React.Component<GameProps, State> {
    constructor() {
        super();
        this.state = {
            history: {
                right: 0,
                wrong: 0,
            },
            data: [],
            choices: [],
            maxIndex: 0,
            correctlyAnswered: false,
            disabled: false,
            answer: {
                index: -1, 
                item: {
                    id: '',
                    type: '', 
                    slug: '',
                    jobTitle: '', 
                    firstName: '',
                    lastName: '',
                    headshot: {
                        type: '', 
                        mimeType: '',
                        id: '',
                        url: '',
                        alt: '',
                        height: 0,
                        width: 0
                    },
                    socialLinks: []
                } 
            }
        };
    }

    event() {
        var obj = this;
        return (e: KeyboardEvent) => {
            switch (e.keyCode) {
                case 49:
                    obj.handleChoiceClick(0);
                    break;
                case 50:
                    obj.handleChoiceClick(1);
                    break;
                case 51:
                    obj.handleChoiceClick(2);
                    break;
                case 52:
                    obj.handleChoiceClick(3);
                    break;
                case 53:
                    obj.handleChoiceClick(4);
                    break;
                case 13:
                    obj.handleNextClick();
                    break;
                default:
                    break;
            }
        };
    }

    componentDidMount() {
        fetch('https://willowtreeapps.com/api/v1.0/profiles/')
            .then( (response) => {
                return response.json(); })   
                    .then( (json) => {
                        this.setState({data: json, maxIndex: json.length - 1});
                        this.getChoices();
                    });

        window.addEventListener('keyup', this.event());
    }
    componentWillUnmount() {
        window.removeEventListener('keyup');
    }
    handleChoiceClick(i: number) {
        let rightNum = this.state.history.right;
        let wrongNum = this.state.history.wrong;
        let correctlyAnswered = this.state.correctlyAnswered;
        if (correctlyAnswered === false) {
            if (i === this.state.answer.index) {
                rightNum++;
                correctlyAnswered = true;
            } else {
                wrongNum++;
            }
            
            this.setState({
                            history: {
                                right: rightNum, 
                                wrong: wrongNum
                            }, 
                            correctlyAnswered: correctlyAnswered
                            }
                        );
        }
    }
    handleNextClick() {
        this.getChoices();
        this.setState({correctlyAnswered: false});
    }
    // Creates an object with the chosen people
    getChoices() {
        let maxChoices: number = 5;
        let choices: Staff[] = this.pickChoices(maxChoices);
        let answerIndex = this.pickAnswer(choices);
        this.setState({choices: choices, 
                       answer: {index: answerIndex, 
                                item: choices[answerIndex]}
                       });

    }
    // Picks 5 random employees to be items array
    //   which represent the possibles choices.
    pickChoices (maxChoices: number) {
        let chosen: Staff[] = [];
        var data: Staff[] = this.state.data.slice();
        while (chosen.length < maxChoices) {
            let indx = this.pickRandomIndex(data.length - 1);
            chosen.push(data[indx]);

            // remove the staffer from the data
            data.splice(indx, 1);
            
        }
        return chosen;
    }

    // Return a random integer with the index in the items array 
    // Arguments:
    //      maxIndex = the highest possible index of the items array
    pickRandomIndex (max: number) {
        return getRandomInt(0, max);
    }

    // Returns the index of the randonly pick answer
    pickAnswer (choices: Staff[]) {
        return this.pickRandomIndex(choices.length - 1); 
    }

    render() {
        return (
            <div className="game">
                <div className="question">
                    <h1>Who is?</h1> 
                    <Name value={this.state.answer || {}} />
                </div>
                <Faces value={this.state.choices || []} onClick={(i: number) => this.handleChoiceClick(i)}/>
                <div className="history">
                    <div id="right">Right: {this.state.history.right}</div>
                    <div id="wrong">Wrong: {this.state.history.wrong}</div>
                 </div>
                 <div className="next">
                     <Next 
                        value={[]}
                        index={-1}
                        onClick={() => this.handleNextClick()} 
                        disabled={this.state.disabled} 
                     />
                 </div>

            </div>
        );

    }
}

export default Game;