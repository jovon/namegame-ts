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
    value: {img: string; index: number};
    disabled: boolean;
    onClick(): void;
}

class Face extends React.Component<FaceProps> {
    constructor(props: FaceProps) {
        super();
    }
    render() {
        return(
            <button 
                    className="face" 
                    id={this.props.value.index.toString()} 
                    onClick={() => this.props.onClick()} 
                    disabled={false}
            >
                <img src={this.props.value.img} />
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
        let imgLocation: string = '';
        if (this.props.value) { 
            if (this.props.value[i] !== undefined) {
                imgLocation = this.props.value[i].headshot.url;
            } else {
                imgLocation = '';
            }
        }
        let value = {img: imgLocation, index: i};
        return <Face value={value} onClick={() => this.props.onClick(i)} disabled={false}/>;
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
            if (e.keyCode === 49) {
                obj.handleChoiceClick(0);
            } 
            if (e.keyCode === 50) {
                obj.handleChoiceClick(1);
            }
            if (e.keyCode === 51) {
                obj.handleChoiceClick(2);
            } 
            if (e.keyCode === 52) {
                obj.handleChoiceClick(3);
            } 
            if (e.keyCode === 53) {
                obj.handleChoiceClick(4);
            } 
            if (e.keyCode === 13) {
                obj.handleNextClick();
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

        window.addEventListener('keyup', this.event);
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
        let choicesIndexes: number[] = this.pickChoices(maxChoices, this.state.data.length);
        let choices: Staff[] = [];
        for (let i = 0; i < maxChoices; i++) {
            choices.push(this.state.data[choicesIndexes[i]]);
        }
        
        let answerIndex = this.pickAnswer(choices);
        this.setState({choices: choices, 
                       answer: {index: answerIndex, 
                                item: choices[answerIndex]}
                       });

    }
    // Picks 5 random integers to be indexes of the items array
    //   which represent the possibles choices.
    pickChoices (maxChoices: number, maxIndex: number) {
        let chosenIndexes: number[] = [];
        while (chosenIndexes.length < maxChoices) {
            let indx = this.pickRandomIndex(maxIndex);
            if (!this.isChosen(indx, chosenIndexes)) {
                chosenIndexes.push(indx);
            }
        }
        return chosenIndexes;
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

    // Was this index already chosen?
    isChosen (indx: number, chosenIndexes: number[]) {
        return undefined !== chosenIndexes.find(function(v: number) {
            return v === indx;
        });
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
                        value={{img: '', index: -1}} 
                        onClick={() => this.handleNextClick()} 
                        disabled={this.state.disabled} 
                     />
                 </div>

            </div>
        );

    }
}

export default Game;