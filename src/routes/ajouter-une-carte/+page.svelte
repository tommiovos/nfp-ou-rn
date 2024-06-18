<script>
    import autosize from 'svelte-autosize';
    import { doc, addDoc, collection } from "firebase/firestore"; 
    import { db } from '$lib/stores/store';

    let onFirstTab = true;
    const switchAnimDuration = 550;
    let animationPlaying = false;

    let partiesOptions = ["NFP", "RN", "EELV", "NPA", "PS", "LR", "PCF"];
    let partiesInNFP = ["LFI", "EELV", "PCF", "PS", "NPA"];
    let partiesOptionsLeft = partiesOptions;
    let partiesOptionsRight = partiesOptions;

    // USER CHOICES BINDINGS
    let valueLeft = "NFP";
    let valueRight = "RN";
    let chosenTitle = "";
    let chosenAnswer = "";
    let chosenAnswerDetails = "";

    $: progress = ((chosenTitle === "" ? 0 : 1) + (chosenAnswer === "" ? 0 : 1) + (chosenAnswerDetails === "" ? 0 : 1)) / 3 * 100;
    $: progressBool = ((chosenTitle === "" ? 0 : 1) + (chosenAnswer === "" ? 0 : 1) + (chosenAnswerDetails === "" ? 0 : 1)) / 3 == 1 ? 1 : 0;

    function onOptionSelected(value, isLeftSide) {
        console.log("cc");
        let newOptions = [];

        if (value === "NFP" || partiesInNFP.includes(value)) {
            console.log("in NFP");
            newOptions = partiesOptions.filter(o => !partiesInNFP.includes(o) && o !== "NFP");
        }
        else {
            console.log("out of NFP");
            newOptions = partiesOptions.filter(o => o != value);    
        }

        console.log("new opts : ", newOptions);

        if (isLeftSide) {
            partiesOptionsRight = newOptions;
            if (!partiesOptionsRight.includes(valueRight)) {
                valueRight = partiesOptionsRight[0];
            }
        }
        else {
            partiesOptionsLeft = newOptions;
            if (!partiesOptionsLeft.includes(valueLeft)) {
                valueLeft = partiesOptionsLeft[0];
            }
        }

        console.log("opts right : ", partiesOptionsRight);
        console.log("opts left : ", partiesOptionsLeft);
    }

    async function switchCards(clickedOnFirstTab) {
        if (animationPlaying) {
            return;
        }
        animationPlaying = true;
        const cardQuestion = document.getElementById("card-question");
        const cardAnswer = document.getElementById("card-answer");

        if (onFirstTab && !clickedOnFirstTab) {
            playMoveCardFront(cardAnswer, cardQuestion);
            setTimeout(() => {onFirstTab = !onFirstTab}, switchAnimDuration*0.6);
            await playMoveCardBack(cardQuestion, cardAnswer);
            animationPlaying = false;
        }
        else if (!onFirstTab && clickedOnFirstTab) {
            playMoveCardFront(cardQuestion, cardAnswer);
            setTimeout(() => {onFirstTab = !onFirstTab}, switchAnimDuration*0.6);
            await playMoveCardBack(cardAnswer, cardQuestion);
            animationPlaying = false;
        }
        else {
            animationPlaying = false;
        }
    }

    async function playMoveCardFront(cardEl, otherCardEl) {
        let newTop = otherCardEl.style.top;

        let anim = cardEl.animate(
            [
                {
                    transform: 'translateX(0%) translateY(0) rotateZ(0deg) rotateY(0deg) scale(1)',
                    zIndex: 5,
                    offset: 0
                },
                {
                    zIndex: 5,
                    offset: 0.39
                },
                {
                    transform: 'translateX(50%) translateY(0) rotateZ(15deg) rotateY(30deg) scale(1)',
                    zIndex: 10,
                    offset: 0.4
                },
                {
                    transform: 'translateX(50%) translateY(0) rotateZ(15deg) rotateY(30deg) scale(1)',
                    zIndex: 10,
                    offset: 0.6
                },
                {
                    transform: 'translateX(0px) translateY(0) rotateZ(0deg) rotateY(0deg) scale(1)',
                    zIndex: 10,
                    offset: 1
                }
            ],
            {
                duration: switchAnimDuration,
                easing: "ease-out"
            }
        );

        await anim.finished;
            
        cardEl.style.zIndex = 10;
        cardEl.style.top = newTop;
    }

    async function playMoveCardBack(cardEl, otherCardEl) {
        let newTop = otherCardEl.style.top;

        let anim = await cardEl.animate(
            [
                {
                    transform: 'translateX(0%) translateY(0) rotateZ(0deg) rotateY(0deg) scale(1)',
                    zIndex: 10,
                    offset: 0
                },
                {
                    zIndex: 10,
                    offset: 0.39
                },
                {
                    transform: 'translateX(-80%) translateY(0) rotateZ(-15deg) rotateY(30deg) scale(1)',
                    zIndex: 5,
                    offset: 0.4
                },
                {
                    transform: 'translateX(-80%) translateY(0) rotateZ(-15deg) rotateY(30deg) scale(1)',
                    zIndex: 5,
                    offset: 0.6
                },
                {
                    transform: 'translateX(0px) translateY(0) rotateZ(0deg) rotateY(0deg) scale(1)',
                    zIndex: 5,
                    offset: 1
                }
            ],
            {
                duration: switchAnimDuration,
                easing: "ease-out"
            }
        );

        await anim.finished;

        cardEl.style.zIndex = 5;
        cardEl.style.top = newTop;
    }

    async function addToCardsStack() {
        if (progressBool != 1) {
            return;
        }
        addDoc(collection($db, "cards"), {
            accepted: false,
            title: chosenTitle,
            answer: chosenAnswer,
            answerDetails: chosenAnswerDetails,
            choiceLeft: valueLeft,
            choiceRight: valueRight,
        }).then(() => {
            //showCreationConfirm();
        }).catch((err) => {
            console.log(err);
        });
    }
</script>


<section class="main">
    <button class="radio-cont choice-tab {onFirstTab ? 'selected' : ''}" on:click={() => switchCards(true)}>
        Choix
    </button>
    
    <button class="radio-cont answer-tab {!onFirstTab ? 'selected' : ''}" on:click={() => switchCards(false)}>
        Réponse  
    </button>

    <div class="swipe-slides" id="slides">
        <div class="card card-question editable-card {onFirstTab ? 'current' : ''}" id="card-question">
            <div class="input-cont">
                <textarea bind:value={chosenTitle} rows="1" use:autosize class="title" 
                    name="title" 
                    id="card-title" 
                    placeholder="Votre question ici"></textarea>
                <div class="input-bg"></div>
            </div>
        </div>

        <div class="card card-answer editable-card {!onFirstTab ? 'current' : ''}" data-is-explanation="true" id="card-answer">
            <div class="input-cont">
                <textarea bind:value={chosenAnswer} rows="1" use:autosize class="title" 
                    name="title" 
                    id="card-title" 
                    placeholder="Réponse"></textarea>
                <div class="input-bg"></div>
            </div>

            <div class="text-cont">
                <textarea bind:value={chosenAnswerDetails} rows="1" use:autosize class="text" 
                    name="text" 
                    id="card-text" 
                    placeholder="Détails de la réponse..."></textarea>
                <div class="input-bg"></div>
            </div>
        </div>
    </div>

    <div class="cont-left choice-cont">
        <p class="text-left select-text">Choix de gauche</p>    
        <select class="parties-left" name="parties-left" id="parties-left" bind:value={valueLeft} on:change={(e) => onOptionSelected(e.target.value, true)}>
            {#each partiesOptionsLeft as opt}
                <option value="{opt}">{opt}</option>    
            {/each}
        </select>
    </div>


    <div class="cont-right choice-cont">
        <p class="text-right select-text">Choix de droite</p>
        <select class="parties-right" name="parties-right" id="parties-right" bind:value={valueRight} on:change={(e) => onOptionSelected(e.target.value, false)}>
            {#each partiesOptionsRight as opt}
                <option value="{opt}">{opt}</option>    
            {/each}
        </select>
    </div>

    <button on:click={addToCardsStack} class="send" style="--progress: {progress}%; --progress-bool: {progressBool}; --text-color: {progressBool == 1 ? 'white' : 'rgb(0, 82, 0)'}">
        <span>
            Ajouter à la pile    
        </span>
    </button>
</section>



<style>
    .card.current {
        top: -3px;
    }
    .card:not(.current) {
        top: 3;
    }
    .card-question {
        z-index: 10;
    }
    .card-answer {
        z-index: 5;
    }
    .send {
        position: relative;
        grid-area: send;
        border-radius: 1rem;
        background-color: white;
        border: 1px solid green;
        color: var(--text-color);
        overflow: hidden;
    }
    .send > span {
        display: block;
        position: relative;
        z-index: 100;
    }
    .send::before {
        content: " ";
        position: absolute;
        z-index: 50;
        top: 0;
        left: 0;
        width: var(--progress);
        height: 100%;
        background-color: green;
        opacity: calc(0.5 + var(--progress-bool));
        border-radius: 0 1rem 1rem 0;
        transition: width 0.2s ease-out;
    }
    .choice-cont {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .cont-left {
        grid-area: left;
    }
    .cont-right {
        grid-area: right;
    }
    .select-text {
        width: 100%;
        color: var(--grey-mid);
        place-self: end center;
    }
    .text-left {
        text-align: left;
    }
    .text-right {
        text-align: right;
    }
    select {
        border-radius: 1rem;
        padding: 1rem;
        width: 100%;
        -webkit-appearance: none;
        appearance: none;
        -moz-appearance: none;
        background-image: url('/caret.svg');
        background-repeat: no-repeat;
        background-size: 1.25rem 1.25rem;
        background-position: calc(100% - 16px);
        flex: 1;
    }
    select:focus-within {
        outline: 2px solid var(--grey);
    }
    .choice-tab {
        grid-area: tab1;
    }
    .answer-tab {
        grid-area: tab2;
    }
    .radio-cont {
        width: 100%;
        height: 100%;
        background-color: white;
        border-radius: 1.25rem;
        display: flex;
        justify-content: center;
        align-items: center;
        outline: none;
        border: 1px solid var(--grey);
        color: var(--grey-mid);
        transition: background-color 0.1s ease-out;
        cursor: pointer;
    }
    .radio-cont.selected {
        background-color: var(--black);
        border-color: var(--black);
        color: white;
        cursor: auto;
    }
    .radio-cont > input {
        /* visibility: hidden; */
    }
    .swipe-slides {
        perspective: 1000px;
    }
    .card {
        transform-origin: center;
        transform-style: preserve-3d;
        overflow: hidden;
        transition: none;
    }
    .card > * {
        filter: none;
    }
    .input-cont {
        position: relative;
        max-width: 100%;
        height: max-content;
    }
    .text-cont {
        position: relative;
    }
    textarea {
        position: relative;
        z-index: 100;
        background-color: transparent;
        resize: none;
        max-width: 100%;
        width: 100%;
        border: 0;
        outline: none;
        border: 0;
    }
    textarea.title {
        display: flex;
        border-radius: 0.5rem;
        padding: 0.5rem 0rem;
        
    }
    textarea.text {
        height: 100%;
    }
    .input-bg {
        --p: 0.5rem;
        pointer-events: none;
        content: " ";
        position: absolute;
        top: calc((var(--p) - var(--p)*2) / 2);
        left: calc((var(--p) - var(--p)*2) / 2);
        background-color: transparent;
        width: calc(100% + var(--p));
        height: calc(100% + var(--p));
        transition: background-color 0.1s ease-out;
        border-radius: 0.5rem;
    }
    textarea:focus-within+.input-bg {
        background-color: rgb(231, 231, 231);
    }

    
    .card-answer textarea:focus-within+.input-bg {
        background-color: rgb(49, 49, 49);
        color: white;
    }

    .card-answer textarea {
        color: white;
    }

    .parties-left {
        grid-area: left;
    }

    .parties-right {
        grid-area: right;
    }

    .main {
        display: grid;
        grid-template-columns: 1fr minmax(120px, 180px) minmax(120px, 180px) 1fr;
        grid-template-rows: 4.5rem auto 6.5rem 4rem;
        grid-template-areas: 
            ". tab1 tab2 ."
            ". slides slides ."
            ". left right ."
            ". send send .";
        gap: 2rem;
        padding: 0.5rem;
        place-content: center;
        height: 100dvh;
        width: 100dvw;
        overflow: hidden;
        padding-top: 4vh;
    }

    @media screen and (min-width: 400px) {
        .main {
            padding: 1rem;    
        }
    }

    @media screen and (min-width: 460px) {
        .main {
            padding: 2rem;    
        }
    }

    .subject {
        grid-area: subject;
        text-align: center;
        font-size: 1.25rem;
    }

    .swipe-slides {
        place-self: center;
        position: relative;
        width: 100%;
        height: auto;
        aspect-ratio: 1/1.4;
        grid-area: slides;
    }
    :global(.swipe-slides .card) {
        width: 100%;
        height: 100%;
    }

    .title {
        font-size: 2rem;
        font-weight: 600;
        padding-bottom: 1rem;
    }

    @media screen and (max-width: 560px) {
        .swipe-slides {
            aspect-ratio: 1/1.5;
        }

        .main {
            gap: 1rem;
        }

        .title {
            font-size: 1.75rem;
        }
    }

    .opt {
        padding-right: 1rem;
        font-size: 1.25rem;
        opacity: 1;
        transition: opacity 0.1s ease-out;
    }

    .rn {
        padding-left: 1rem;
        width: 100%;
        height: 100%;
        text-align: left;
        grid-area: rn;
        place-self: center;
    }

    .rn:not(.colored) {
        opacity: calc(0.5 - var(--slide-mag-left)/2);
        font-weight: calc(500 + var(--slide-mag-left)*120);
    }


    .nfp {
        padding-right: 1rem;
        width: 100%;
        height: 100%;
        text-align: right;
        grid-area: nfp;
        place-self: center;
    }

    .nfp:not(.colored) {
        opacity: calc(0.5 - var(--slide-mag-right)/2);
        font-weight: calc(500 + var(--slide-mag-right)*120);
    }

    .colored {
        opacity: 0;
    }

    .rn.colored {
        color: var(--left-color);
        opacity: var(--slide-mag-left);
        font-weight: calc(500 + var(--slide-mag-left)*120);
    }

    .nfp.colored {
        color: var(--right-color);
        opacity: var(--slide-mag-right);
        font-weight: calc(500 + var(--slide-mag-right)*120);
    }

    .next {
        padding: 0 1rem 0 1rem;
        text-align: center;
        grid-row: 3/4;
        grid-column: 2/4;
        opacity: calc(0.5 + (var(--slide-mag) * var(--slide-mag)) / 2);
        font-weight: calc(400 + (var(--slide-mag) * var(--slide-mag)) * 120);
    }

    .stop-transition {
        transition: none !important;
    }


    @keyframes move-card-back {
        0% {
            transform: translateX(0px) translateY(0px) rotateZ(0deg) rotateY(0deg) scale(1) translateZ(10px);
            z-index: 10;
        }
        39% {
            z-index: 10;
        }
        40%,60% {
            transform: translateX(-80%) translateY(5%) rotateZ(-15deg) rotateY(30deg) scale(1) translateZ(8px);
            z-index: 5;
        }
        100% {
            transform: translateX(0%) translateY(0) rotateZ(0deg) rotateY(0deg) scale(0.98) translateZ(5px);
            z-index: 5;
        }
    }

    @keyframes move-card-front {
        0% {
            transform: translateX(0%) translateY(0) rotateZ(0deg) rotateY(0deg) scale(0.98) translateZ(10px);
            z-index: 5;
        }
        39% {
            z-index: 5;
        }
        40%,60% {
            transform: translateX(50%) translateY(5%) rotateZ(15deg) rotateY(30deg) scale(0.98) translateZ(12px);
            z-index: 10;
        }
        100% {
            transform: translateX(0px) translateY(0px) rotateZ(0deg) rotateY(0deg) scale(1) translateZ(15px);
            z-index: 10;
        }
    }
</style>