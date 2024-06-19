<script lang="ts">
    import { onMount, tick } from 'svelte';
    import Card from '$lib/components/Card.svelte';
    import {currentCard, isCurrentPriority, slideMagnitude} from '$lib/stores/store'
    import { isCurrentExplanation, isLoading } from '$lib/stores/store';
    import { blur } from 'svelte/transition';
    import { db } from '$lib/stores/store';
    import { browser } from '$app/environment';
    import { collection, getDocs, query, where } from 'firebase/firestore';

    let currentCardVal: number = 0;
    let isCurrentExplanationVal: boolean = false;
    let isCurrentPriorityVal: boolean = false;

    let slideMagVal = 0;
	const unsub = slideMagnitude.subscribe((v) => slideMagVal = v);

    let userCards = [];
    
    let isLoadingVal = true;
    let isLoadingEarly = true;
    const unsubIsLoading = isLoading.subscribe((v) => isLoadingVal = v);

    onMount(() => {
        if (browser) {
            async function setLoadingFalse() {
                isLoadingEarly = false;
                await tick();
                isLoading.set(false);
            }
            async function loadData() {
                const q = query(collection($db, "cards"), where("accepted", "==", true));
                await getDocs(q).then((res) => {
                    res.forEach(v => userCards.push(v.data()));    
                    userCards = [...userCards];
                    setLoadingFalse();
                });
                console.log("user cards : ", userCards);
            } 

            loadData();
        }
    });

    function swipeManual(side="right") {
        const slides = document.getElementById("slides");
        if (slides == null || slides.children.length == 0) {
            return;
        }
        const firstCard = slides.children[0];

        const multiplier = side.toLowerCase() === 'left' ? -1 : 1;

        firstCard.animate(
                [
                    {
                        transform: 'translateX(0) translateY(0) rotate(0deg)',
                        opacity: 1,
                    },
                    {
                        transform: 'translateX(' + 80 * multiplier + '%) translateY(15%) rotate(' + 20 * multiplier +'deg)',
                        opacity: 0.9,
                    },
                    {
                        transform: 'translateX(' + 130 * multiplier + '%) translateY(60%) rotate(' + 38 * multiplier +'deg)',
                        opacity: 0,
                    }
                ],
                {
                    duration: 400,
                    easing: 'ease-out'
                }
            )
    }

    const unsubCard = currentCard.subscribe((v) => currentCardVal = v);
    const unsubIsExplanation = isCurrentExplanation.subscribe((v) => isCurrentExplanationVal = v);
    const unsubIsPriorityVal = isCurrentPriority.subscribe((v) => isCurrentPriorityVal = v);

</script>

<section class="main">
    {#if !isLoadingEarly}
        {#if isCurrentPriorityVal}
            <p class="subject" transition:blur={{ delay: 0, duration: 170 }}>Ce sujet est il prioritaire pour vous ?</p>
        {/if}
        <div class="swipe-slides" id="slides">
            <Card isCurrent={true} isPriorityChoice={true}>
                <p class="title">L'immigration</p>
            </Card>
            <Card isCurrent={false} isPriorityChoice={true}>
                <p class="title">L'écologie</p>
            </Card>
            <Card isCurrent={false}>
                <p class="title">A voté contre l'augmentation du SMIC à 1500 euros net</p>
            </Card>
            <Card isCurrent={false} isExplanation={true}>
                <p class="title">RN</p>
                <p class="text">
                    L'amendement presenté par Clémence GUETTE (LFI), à été refusé 257 voix contre 121. <br><br>
                    Parmi ces 257 voix contre on retrouve l'ensemble des députés macronistes, les républicains et le RN, à l'exception de 4 députés qui s'abstiennent.
                </p>
            </Card>
            {#each userCards as cardData}
                <Card isCurrent={false} isExplanation={false}>
                    <p class="title">{cardData.title}</p>
                </Card>
                <Card isCurrent={false} isExplanation={true}>
                    <p class="title">{cardData.answer}</p>
                    <p class="text">
                        {cardData.answerDetails}
                    </p>
                </Card>
            {/each}
        </div>

        {#if !isCurrentExplanationVal && !isCurrentPriorityVal}
            <button on:click={() => swipeManual('left')} class="rn rn-colored colored opt {slideMagVal <= -1 ? 'slide-done' : ''} {slideMagVal < 0 ? 'dragged' : ''}" transition:blur={{ delay: 0, duration: 170 }}>RN</button>
            <button class="rn opt" transition:blur={{ amount: 10, duration: 170 }}>RN</button>
            <button on:click={() => swipeManual('right')} class="nfp nfp-colored colored opt {slideMagVal >= 1 ? 'slide-done' : ''} {slideMagVal > 0 ? 'dragged' : ''}" transition:blur={{ delay: 0,amount: 10, duration: 170 }}>NFP</button>
            <button class="nfp opt" transition:blur={{ delay: 0, duration: 170 }}>NFP</button>
        {:else if isCurrentPriorityVal}
            <button on:click={() => swipeManual('left')} class="rn rn-colored colored opt {slideMagVal <= -1 ? 'slide-done' : ''} {slideMagVal < 0 ? 'dragged' : ''}" transition:blur={{ delay: 0, duration: 170 }}>Pas prioritaire</button>
            <button class="rn opt" transition:blur={{ amount: 10, duration: 170 }}>Pas prioritaire</button>
            <button on:click={() => swipeManual('right')} class="nfp nfp-colored colored opt {slideMagVal >= 1 ? 'slide-done' : ''} {slideMagVal > 0 ? 'dragged' : ''}" transition:blur={{ delay: 0,amount: 10, duration: 170 }}>Prioritaire</button>
            <button class="nfp opt" transition:blur={{ delay: 0, duration: 170 }}>Prioritaire</button>
        {:else}
            <p class="next" transition:blur={{ delay: 0, duration: 170 }}>Glisser pour passer à la suite</p>
        {/if}
    {/if}
</section>



<style>
    .main {
        display: grid;
        grid-template-columns: 1fr minmax(120px, 180px) minmax(120px, 180px) 1fr;
        grid-template-rows: 1.5rem auto 4rem;
        grid-template-areas: 
            ". subject subject ."
            ". slides slides ."
            ". rn nfp .";
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

    @media screen and (max-width: 560px) {
        .main {
            grid-template-rows: 2.25rem auto 3.75rem;
        }
        .swipe-slides {
            margin-bottom: 1.5rem;
        }
    }
    
    @media screen and (max-width: 420px) {
        .main {
            grid-template-rows: 3rem auto 3.75rem;
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
        position: relative;
        font-size: 2rem;
        font-weight: 600;
        padding-bottom: 1rem;
    }

    .opt {
        /* border: 1px solid var(--grey); */
        border: none;
        background-color: rgb(227, 227, 227);
        border-radius: 1rem;
        font-size: 1.25rem;
        opacity: 1;
        transition: opacity 0.1s ease-out;
        display: flex;
        align-items: center;
        color: rgb(90, 90, 90);
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

        .opt {
            font-size: 1rem;
        }
    }

    .rn {
        padding-left: 1rem;
        width: 100%;
        height: 100%;
        text-align: left;
        grid-area: rn;
        place-self: center;
        justify-content: flex-start;
    }


    .nfp {
        padding-right: 1rem;
        width: 100%;
        height: 100%;
        text-align: right;
        grid-area: nfp;
        place-self: center;
        justify-content: flex-end;
    }

    .colored {
        opacity: 0;
    }

    .rn.slide-done {
        background-color: var(--left-color);
        color: white;
    }

    .next {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        height: 100%;
        padding: 0 1rem 0.35rem 1rem;
        text-align: center;
        grid-row: 3/4;
        grid-column: 2/4;
        opacity: calc(0.5 + (var(--slide-mag) * var(--slide-mag)) / 2);
        font-weight: calc(400 + (var(--slide-mag) * var(--slide-mag)) * 120);
    }

    .stop-transition {
        transition: none !important;
    }


    @media screen and (max-height: 780px) {
        .swipe-slides {
            aspect-ratio: 1/1.3;
        }

        :global(.card .title) {
            font-size: 1.5rem;
        }

        :global(.card p){
            font-size: 1rem;
        }

        :global(.subject) {
            font-size: 1rem !important;
            place-self: end center !important;
        }
    }
</style>
