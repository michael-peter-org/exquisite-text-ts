import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import Button from 'react-bootstrap/Button';
import ContentEditable from 'react-contenteditable';

// this function allows us to get the most current value of a state variable
// with the third output argument "ref"
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

    const minCharsOnNewLine = 20;       // must have more than this many characters on 2nd line to make exquisite
    const maxCharsOnNewLine = 40;       // must have less than this many characters on 2nd line to make exquisite
    const introDivStringLength = 32;    // string length of default introductory div tag for each line in poem body
    const initVertSpacerText = '\n';    // newlines initially in the spacing div above the poem body
    const poemTitleCharacterWidth = 50;

    // the poemBody is a useRef of type string, which will act as html content
    // for a ContentEditable div (specialized React object)
    const poemBody = useRef<string>(
        `<div class="poem-line">Just another Tuesday. Suddenly the sky opened up and there it was:</div>
        <div class="poem-line">a burning golden bird with no legs.</div>`
    );

    // the poem title is similar I guess
    const poemTitle = useRef<string>(
        // `<div class="poem-title">exquisite text #${Math.round(Math.random() * 100)}</div>`
            `exquisite text #${Math.round(Math.random() * 100)}`
    );

    // an array in which each element is a string representing a line of the poem
    const [cumulativePoem, setCumulativePoem] = useState<string[]>([]);

    // a single string array that will be a sequence of newline characters
    // we get them to render using the css class named 'render-newline'
    const [vertSpacerText, setVertSpacerText] = useState<string>(initVertSpacerText);

    // a single boolean that determines whether the "Done Line" button should be enabled or disabled
    // it toggles based on the suitability of the current poem body to be made exquisite
    // we need an additional buttonRef object that allows us to get its current state
    const [buttonEnabled, setButtonEnabled, buttonRef] = useStateRef(true);

    // handles any change to the ContentEditable div object (user entered a new character or deleted one)
    // one for the poem title
    function handlePoemTitleChange(evt: { target: { value: string; }; }) {
        poemTitle.current = evt.target.value;
    }

    // one for the poem body
    function handlePoemBodyChange(evt: { target: { value: string; }; }) {
        poemBody.current = evt.target.value;
        const poemParts = poemBody.current.split('</div>')
        // remove the initial div and any trailing spaces
        const poemSecondLine = poemParts[1].slice(introDivStringLength).replace('&nbsp;', '')
        // only enable the button if there are 2 lines AND the 2nd line is between 20 and 40 characters
        setButtonEnabled(poemParts.length === 3 &&
            poemSecondLine.length > minCharsOnNewLine &&
            poemSecondLine.length < maxCharsOnNewLine);
    }

    function handleKeypress(e: { keyCode: number; ctrlKey: boolean; }) {
        // it triggers by pressing ctrl + enter (13), when the "Done Line" button is enabled
        // might not be necessary, but it's kind of nice
        // note we use buttonRef instead of buttonEnabled because it gets the current value
        if (buttonRef.current && e.keyCode === 13 && e.ctrlKey) {
            makeExquisite();
        }
    }

    function makeExquisite() {
        // this function takes approximately 1.5 lines of poem, and "makes them exquisite" by clipping the 1st line.
        // the next person who sees the result should not be aware of the 1st line but must continue with a new line
        const divTextParts = poemBody.current.trim().split('</div>');
        // check user input, should be two lines, although access to even executing this function is regulated
        // by the buttonRef value, which enables and disables the button
        if (divTextParts.length > 1) {
            const [firstPart, secondPart] = divTextParts;
            poemBody.current = secondPart;                              // sets the contentEditable div (poem body)
            setCumulativePoem([ ...cumulativePoem, firstPart ]);  // sets the cumulative array of poem lines
            setVertSpacerText(vertSpacerText + '\n');             // sets the spacing text above the poem
        }
    }

    function finishExquisite() {
        // when the poem is probably done, we can end it by pulling back the curtain to reveal the whole thing at once
        // to do so here, we use array of lines that have been saved in the background, and reconstruct the whole thing
        // by simply appending on the current state
        const currentText = poemBody.current.trim();
        setVertSpacerText(initVertSpacerText); // revert vertical spacer to it's initial value
        poemBody.current = [ ...cumulativePoem, currentText ].join('<div class="poem-line"></div>');
        // presumably we should save the state of that poem somewhere...
        setCumulativePoem([]); // re-initialize the array?
    }

    return (
        <div className="App">

            <div className="render-newline">{'\n'}</div>

            <input
                type="text"
                defaultValue={poemTitle.current}
                onChange={handlePoemTitleChange}
                className='poem-title'
                size={poemTitleCharacterWidth}
            />

            <div className="render-newline">{vertSpacerText}</div>

            <ContentEditable
                html={poemBody.current} // innerHTML of the editable div
                disabled={false} // use true to disable edition
                onChange={handlePoemBodyChange} // handle innerHTML change
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
