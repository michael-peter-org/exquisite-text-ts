import React, { useState, useRef, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Button from 'react-bootstrap/Button';
import ContentEditable from 'react-contenteditable';

// black magic from stack overflow
// https://stackoverflow.com/questions/53845595/wrong-react-hooks-behaviour-with-event-listener
function useStateRef(initialValue: any) {
    const [value, setValue] = useState(initialValue);

    const ref = useRef(value);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return [value, setValue, ref];
}

function App() {
    const poemBody = useRef<string>(
        `<div class="poem-line">Just another Tuesday. Suddenly the sky opened up and there it was:</div>
        <div class="poem-line">a burning golden bird with no legs.</div>`
    );
    const [cumulativePoem, setCumulativePoem] = useState<string[]>([]);
    const [vertSpacerText, setVertSpacerText] = useState<string>('\n');
    const [buttonEnabled, setButtonEnabled, buttonRef] = useStateRef(true);
    function handleChange(evt: { target: { value: string; }; }) {
        poemBody.current = evt.target.value;
        const poemParts = poemBody.current.split('</div>')
        // remove the initial div and any trailing spaces
        const poemSecondLine = poemParts[1].slice(32).replace('&nbsp;', " ")
        // only enable the button if there are 2 lines...
        // AND the new line is between 22 and 44 characters
        setButtonEnabled(poemParts.length === 3 && poemSecondLine.length > 22 && poemSecondLine.length < 44);
    }

    function handleKeypress(e: { keyCode: number; ctrlKey: boolean; }) {
        // it triggers by pressing the enter key, when the button is enabled
        if (buttonRef.current && e.keyCode === 13 && e.ctrlKey) {
            makeExquisite();
        }
    }

    function makeExquisite() {
        const divTextParts = poemBody.current.trim().split('</div>');
        // check user input, should be two lines...
        if (divTextParts.length > 1) { // correctly formatted (2 lines)
            const [firstPart, secondPart] = divTextParts;
            poemBody.current = secondPart  // sets the contentEditable, works fine
            setCumulativePoem([ ...cumulativePoem, firstPart ]) // sets the array of lines, seems to be lagging
            setVertSpacerText(vertSpacerText + '\n')
        }
    }
    function finishExquisite() {
        const currentText = poemBody.current.trim();
        setVertSpacerText('\n')
        poemBody.current = [ ...cumulativePoem, currentText ].join('<div class="poem-line"></div>')
        // presumably we should save the state of that poem somewhere...
        setCumulativePoem([]) // re-initialize
    }
    return (
        <div className="App">

            <div className="render-newline">{vertSpacerText}</div>

            <ContentEditable
                html={poemBody.current} // innerHTML of the editable div
                disabled={false} // use true to disable edition
                onChange={handleChange} // handle innerHTML change
                onKeyDown={handleKeypress}
                className='poem-body'
            />

            <div className="render-newline">{'\n'}</div>

            <Button onClick={makeExquisite} disabled={!buttonEnabled}>
                Done Line
            </Button>

            <Button onClick={finishExquisite}>
                Done Poem
            </Button>
        </div>
    );
}

export default App;
