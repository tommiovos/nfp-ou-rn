<script lang="ts">
    import { onMount, tick } from 'svelte';
    import Card from '$lib/components/Card.svelte';
    import {currentCard, isCurrentPriority} from '$lib/stores/store'
    import { isCurrentExplanation, isLoading } from '$lib/stores/store';
    import { blur } from 'svelte/transition';
    import { db } from '$lib/stores/store';
    import { browser } from '$app/environment';
    import { collection, getDocs, query, where } from 'firebase/firestore';

    let currentCardVal: number = 0;
    let isCurrentExplanationVal: boolean = false;
    let isCurrentPriorityVal: boolean = false;

    let userCards = [];
    
    let isLoadingVal = true;
    const unsubIsLoading = isLoading.subscribe((v) => isLoadingVal = v);

    onMount(() => {
        if (browser) {
            async function setLoadingFalse() {
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
    })

    const unsubCard = currentCard.subscribe((v) => currentCardVal = v);
    const unsubIsExplanation = isCurrentExplanation.subscribe((v) => isCurrentExplanationVal = v);
    const unsubIsPriorityVal = isCurrentPriority.subscribe((v) => isCurrentPriorityVal = v);

</script>

<section class="main">
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
        <p class="rn rn-colored colored opt" transition:blur={{ delay: 0, duration: 170 }}>RN</p>
        <p class="rn opt" transition:blur={{ amount: 10, duration: 170 }}>RN</p>
        <p class="nfp nfp-colored colored opt" transition:blur={{ delay: 0,amount: 10, duration: 170 }}>NFP</p>
        <p class="nfp opt" transition:blur={{ delay: 0, duration: 170 }}>NFP</p>
    {:else if isCurrentPriorityVal}
        <p class="rn rn-colored colored opt" transition:blur={{ delay: 0, duration: 170 }}>Pas prioritaire</p>
        <p class="rn opt" transition:blur={{ amount: 10, duration: 170 }}>Pas prioritaire</p>
        <p class="nfp nfp-colored colored opt" transition:blur={{ delay: 0,amount: 10, duration: 170 }}>Prioritaire</p>
        <p class="nfp opt" transition:blur={{ delay: 0, duration: 170 }}>Prioritaire</p>
    {:else}
        <p class="next" transition:blur={{ delay: 0, duration: 170 }}>Glisser pour passer à la suite</p>
    {/if}
</section>



<style>
    .main {
        display: grid;
        grid-template-columns: 1fr minmax(120px, 180px) minmax(120px, 180px) 1fr;
        grid-template-rows: 2rem auto 1rem;
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
</style>
