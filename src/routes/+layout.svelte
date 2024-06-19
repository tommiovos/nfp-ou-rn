<script context="module">
	import interact from "interactjs";
</script>
<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, tick } from 'svelte';
	import { currentCard, isCurrentExplanation, isLoading } from "$lib/stores/store";
	import { isCurrentPriority } from "$lib/stores/store";
	import { slideMagnitude } from "$lib/stores/store";

	// CHANGE TODO : Change so the base css styles etc are only set once loading is done, otherwise the user cards don't display correctly (lower z-index ie)


	let isLoadingVal = true;
	let didFirstLoad = false;
	const unsubIsLoading = isLoading.subscribe((v) => {
		if (!didFirstLoad && v == false) {
			setupCards();
		}
	});

	// SLIDE
	let slideMagVal = 0;
	const unsub = slideMagnitude.subscribe((v) => slideMagVal = v);

	let currentCardVal: number = 0;
    let isCurrentExplanationVal: boolean = false;
    let isCurrentPriorityVal: boolean = false;

    const unsubCard = currentCard.subscribe((v) => currentCardVal = v);
    const unsubIsExplanation = isCurrentExplanation.subscribe((v) => isCurrentExplanationVal = v);
    const unsubIsPriorityVal = isCurrentPriority.subscribe((v) => isCurrentPriorityVal = v);

	const interactThreshold = 90;
	const interactMaxRotation = 15;

	const red = "#E40E32";
	const blue = "#1F40B8";
	const black = "#1C1C1C";
	const green = "#89C706";
	const grey = "#C5C5C5";

	let rightColor = grey;
	let leftColor = grey;

	let rotation = 0;
	let x = 0;
	let y = 0;
	let currentCardId = 0;
	// https://hankchizljaw.com/wrote/get-css-custom-property-value-with-javascript/#heading-the-getcsscustomprop-function
	const getCSSCustomProp = (propKey, element = document.documentElement, castAs = 'string') => {
		let response = getComputedStyle(element).getPropertyValue(propKey);
		// Tidy up the string if there's something to work with
		if (response.length) {
			response = response.replace(/\'|"/g, '').trim();
		}
		// Convert the response into a whatever type we wanted
		switch (castAs) {
			case 'number':
			case 'int':
				return parseInt(response, 10);
			case 'float':
				return parseFloat(response, 10);
			case 'boolean':
			case 'bool':
				return response === 'true' || response === '1';
		}
		// Return the string response by default
		return response;
	};

	function setBorderColor(x, slideMagRight, slideMagLeft) {

		let newColor = "#C5C5C5";

		if (slideMagRight > 0) {
			newColor = blendColors(grey, rightColor, slideMagRight);
		}
		else if (slideMagLeft > 0) {
			newColor = blendColors(grey, leftColor, slideMagLeft);
		}

		document.documentElement.style.setProperty('--blended-color', newColor + '');
	}

	function setSlideMag(x) {
		let _slideMagnitude = (x/interactThreshold);
		let slideMagnitudeRight = _slideMagnitude;
		let slideMagnitudeLeft = Math.abs(x)/interactThreshold;

		if (slideMagnitudeRight > 0) {
			slideMagnitudeLeft = 0;
		}
		else if (slideMagnitudeLeft > 0) {
			slideMagnitudeRight = 0;
		}

		if (slideMagnitudeRight > 1) {
			slideMagnitudeRight = 1;
		}
		else if (slideMagnitudeLeft > 1) {
			slideMagnitudeLeft = 1;
		}

		if (_slideMagnitude > 1) {
			_slideMagnitude = 1
		}
		else if (_slideMagnitude < -1) {
			_slideMagnitude = -1;
		}
		slideMagnitude.set(_slideMagnitude);
		document.documentElement.style.setProperty('--slide-mag', _slideMagnitude + '');
		document.documentElement.style.setProperty('--slide-mag-right', slideMagnitudeRight + '');
		document.documentElement.style.setProperty('--slide-mag-left', slideMagnitudeLeft + '');

		return {
			magRight : slideMagnitudeRight,
			magLeft: slideMagnitudeLeft,
		}
	}

	function dragMoveListener(event) {
		var target = event.target
		// keep the dragged position in the custom properties
		x = (getCSSCustomProp('--card-x', target, 'float') || 0) + event.dx
		y = (getCSSCustomProp('--card-y', target, 'float') || 0) + event.dy
		// add rotation based on card position
		rotation = interactMaxRotation * (x / interactThreshold);
		if (rotation > interactMaxRotation) rotation = interactMaxRotation;
		else if (rotation < -interactMaxRotation) rotation = -interactMaxRotation;
		// update styles
		target.style.setProperty('--card-x', x + 'px');
		target.style.setProperty('--card-y', y + 'px');
		target.style.setProperty('--card-r', rotation + 'deg');

		let mags = setSlideMag(x);

		if (mags.magLeft == 1) {
			target.setAttribute('data-drag-state', 'left');
		}
		else if (mags.magRight == 1) {
			target.setAttribute('data-drag-state', 'right');
		}
		else {
			target.setAttribute('data-drag-state', 'none');
		}
		setBorderColor(x, mags.magRight, mags.magLeft);
	}
	onMount(() => {
		// get viewport width
		const vw = document.documentElement.clientWidth;
		// create an off canvas x coordinate
		let offX = 400;
		if (vw > 400) {
			offX = vw;
		}
		// interact.js
		interact('.card[data-status="current"]:not(:last-child)').draggable({
			onstart: (e) => {
				// signify dragging
				e.target.setAttribute('data-dragging', true);
			},
			// call this function on every dragmove event
			onmove: dragMoveListener,
			// call this function on every dragend event
			onend: (event) => {
				// signify dragging stopped
				event.target.setAttribute('data-dragging', false);
				// calculate how far card moved
				let moved = (Math.sqrt(Math.pow(event.pageX - event.x0, 2) | 0));

				if (moved > interactThreshold) {
					// remove card
					event.target.setAttribute('data-status', "transition");
					if (x > 0) {
						x = offX;
					} else {
						x = (offX * -1);
					}
					// mark as done after CSS transition
					event.target.addEventListener('transitionend', () => {
						event.target.remove();
					});
					// activate next card
					event.target.nextElementSibling.setAttribute('data-status', 'current');
					event.target.nextElementSibling.setAttribute('data-show', 'true');

                    const slidesEl = document.getElementById("slides");
                    if (slidesEl == null) { return; }
                    const children = Array.from(slidesEl.children) as HTMLElement[];
                    let offsetStep = 3;
                    let delayStep = 50;
                    let i = 1;
					let scale = 1;
					let offsetX = 2;

                    children.forEach(child => {
                        if (child != event.target) {
							let newOffset = offsetX + "px";
							let newScale = scale;
							let currIndex = i;
							setTimeout(() => {
								child.style.top = newOffset;
								child.style.setProperty('--card-y', ((1 - 0.002*currIndex) + ''));
								child.style.setProperty('--scale', newScale + '');	
							}, i*delayStep);

							console.log("del : ", i*delayStep);
							
							scale -= 0.002;
							offsetX += offsetStep;
							i++;
                        }
                    });

					currentCardId += 1;
					isCurrentExplanation.set(event.target.nextElementSibling.getAttribute('data-is-explanation') == 'true');
					isCurrentPriority.set(event.target.nextElementSibling.getAttribute('data-is-priority') == 'true');

					if (isCurrentPriorityVal) {
						rightColor = green;
						leftColor = red;
					}
					else {
						rightColor = red;
						leftColor = blue;
					}
					document.documentElement.style.setProperty('--right-color', rightColor);
					document.documentElement.style.setProperty('--left-color', leftColor);
					document.documentElement.style.setProperty('--right-color-light', blendColors(rightColor, "#ffffff", 0.8));
					document.documentElement.style.setProperty('--left-color-light', blendColors(leftColor, "#ffffff", 0.8));
					document.documentElement.style.setProperty('--right-color-dark', blendColors(rightColor, "#000000", 0.8));
					document.documentElement.style.setProperty('--left-color-dark', blendColors(leftColor, "#000000", 0.8));

					let mags = setSlideMag(0);
					setBorderColor(x, mags.magRight, mags.magLeft);
				}
				else {
					// reset vars
					x = 0;
					y = 0;
					rotation = 0;
					// update rotation
					event.target.style.setProperty('--card-r', rotation + 'deg');
					// update x and y pos
					event.target.style.setProperty('--card-x', x + 'px');
					event.target.style.setProperty('--card-y', y + 'px');

					let mags = setSlideMag(x);
					setBorderColor(x, mags.magRight, mags.magLeft);
				}
			}
		});
	});


	// SETUP CARDS
	function setupCards() {
		if (browser) {
			const slidesEl = document.getElementById("slides");

			if (slidesEl == null) {
				return;
			}

			const children = Array.from(slidesEl.children) as HTMLElement[];
			let z = (children.length*10) + 10;
			let offsetX = 2;
			let offsetStep = 3;
			let scale = 1;
			let i = 0;

			document.documentElement.style.setProperty('--slide-mag', 0 + '');
			document.documentElement.style.setProperty('--slide-mag-right', 0 + '');
			document.documentElement.style.setProperty('--slide-mag-left', 0 + '');
			document.documentElement.style.setProperty('--blended-color', "#C5C5C5");


			children.forEach(child => {
				console.log(i);
				console.log(scale);
				console.log("--");
				if (i == 0) {
					currentCard.set(child);
					child.classList.remove("blur");
					isCurrentPriority.set(child.getAttribute('data-is-priority') == 'true');
					tick().then(() => {
						console.log("hey");
						if (isCurrentPriorityVal) {
							rightColor = green;
							leftColor = red;
						}
						else {
							rightColor = red;
							leftColor = blue;
						}	
						document.documentElement.style.setProperty('--right-color', rightColor);
						document.documentElement.style.setProperty('--left-color', leftColor);
						document.documentElement.style.setProperty('--right-color-light', blendColors(rightColor, "#ffffff", 0.8));
						document.documentElement.style.setProperty('--left-color-light', blendColors(leftColor, "#ffffff", 0.8));
						document.documentElement.style.setProperty('--right-color-dark', blendColors(rightColor, "#000000", 0.8));
						document.documentElement.style.setProperty('--left-color-dark', blendColors(leftColor, "#000000", 0.8));
					});
					isCurrentExplanation.set(child.getAttribute('data-is-explanation') == 'true');
				}
				child.classList.add("stop-transition");

				child.style.zIndex = z.toString();
				child.style.top = offsetX + "px";
				child.style.setProperty('--scale', scale + '');

				child.classList.remove("stop-transition");

				offsetX += offsetStep;
				z -= 10;
				scale -= 0.002;
				i++;
			});
        	}
		}


	// COLOR BLENDING

	function blendColors(color1, color2, percentage)
	{
		// check input
		color1 = color1 || '#000000';
		color2 = color2 || '#ffffff';
		percentage = percentage || 0.5;

		// 1: validate input, make sure we have provided a valid hex
		if (color1.length != 4 && color1.length != 7) {
			throw new error('colors must be provided as hexes');	
		}

		if (color2.length != 4 && color2.length != 7) {
			throw new error('colors must be provided as hexes');   	
		}

		if (percentage > 1 || percentage < 0) {
			throw new error('percentage must be between 0 and 1');	
		}


		// 2: check to see if we need to convert 3 char hex to 6 char hex, else slice off hash
		//      the three character hex is just a representation of the 6 hex where each character is repeated
		//      ie: #060 => #006600 (green)
		if (color1.length == 4)
			color1 = color1[1] + color1[1] + color1[2] + color1[2] + color1[3] + color1[3];
		else
			color1 = color1.substring(1);
		if (color2.length == 4)
			color2 = color2[1] + color2[1] + color2[2] + color2[2] + color2[3] + color2[3];
		else
			color2 = color2.substring(1);   

		// 3: we have valid input, convert colors to rgb
		color1 = [parseInt(color1[0] + color1[1], 16), parseInt(color1[2] + color1[3], 16), parseInt(color1[4] + color1[5], 16)];
		color2 = [parseInt(color2[0] + color2[1], 16), parseInt(color2[2] + color2[3], 16), parseInt(color2[4] + color2[5], 16)];

		// 4: blend
		const color3 = [ 
			(1 - percentage) * color1[0] + percentage * color2[0], 
			(1 - percentage) * color1[1] + percentage * color2[1], 
			(1 - percentage) * color1[2] + percentage * color2[2]
		];

		// 5: convert to hex
		const color3Hex = '#' + intToHex(color3[0]) + intToHex(color3[1]) + intToHex(color3[2]);

		// return hex
		return color3Hex;
	}

	/*
		convert a Number to a two character hex string
		must round, or we will end up with more digits than expected (2)
		note: can also result in single digit, which will need to be padded with a 0 to the left
		@param: num         => the number to conver to hex
		@returns: string    => the hex representation of the provided number
	*/
	function intToHex(num)
	{
		var hex = Math.round(num).toString(16);
		if (hex.length == 1)
			hex = '0' + hex;
		return hex;
	}
</script>

<main class="container">
	<slot></slot>
</main>

<style>
	/* @import url('https://fonts.googleapis.com/css2?family=Hedvig+Letters+Sans&display=swap');
	@import url('https://fonts.googleapis.com/css2?family=Geologica:wght@100..900&display=swap'); 
	@import url('https://fonts.googleapis.com/css2?family=Onest:wght@100..900&display=swap'); */
	@import url('https://fonts.googleapis.com/css2?family=Golos+Text:wght@400..900&display=swap');

	:global(:root) {
		--red: #E40E32;
		--blue: #1F40B8;
		--black: #1C1C1C; 
		--grey: #C5C5C5;
		--grey-mid: #9D9D9D;
	}
	/*
	1. Use a more-intuitive box-sizing model.
	*/
	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}
	/*
	2. Remove default margin
	*/
	:global(*) {
		margin: 0;
	}
	:global(p, span, div, pre, input, textarea) {
		font-family: "Golos Text", sans-serif;
  		font-optical-sizing: auto;
	}
	/*
	Typographic tweaks!
	3. Add accessible line-height
	4. Improve text rendering
	*/
	:global(body) {
		-height: 1.5;
		-webkit-font-smoothing: antialiased;
	}
	/*
	5. Improve media defaults
	*/
	:global(img, picture, video, canvas, svg) {
		display: block;
		max-width: 100%;
	}
	/*
	6. Remove built-in form typography styles
	*/
	:global(input, button, textarea, select) {
		font: inherit;
	}
	/*
	7. Avoid text overflows
	*/
	:global(p, h1, h2, h3, h4, h5, h6) {
		overflow-wrap: break-word;
	}
	/*
	8. Create a root stacking context
	*/
	:global(#root, #__next) {
		isolation: isolate;
	}



	:global(.card p) {
		font-size: 1.25rem;
	}
	:global(.card .text) {
		line-height: 2rem;
	}
	:global(.card) {
		--card-x: 0;
		--card-y: 0;
		--card-r: 0deg;
		--scale: 1;
		
		-ms-touch-action: none;
  		touch-action: none;

		background-color: white;
		border: 1px solid #C5C5C5;
		border-radius: 2rem;
		position: absolute;
		top: 0;
		left: 0;
		transform: scale(var(--scale));
		padding: 2.3rem;
		transition: box-shadow 0.2s, transform 0.25s ease-out, top 0.25s ease-out 0.3s, opacity 0.3s ease-out, background-color 0.12s ease-out, color 0.12s ease-out;
		box-shadow: -64px 173px 52px 0px rgba(0, 0, 0, 0.00), -41px 111px 47px 0px rgba(0, 0, 0, 0.00), -23px 62px 40px 0px rgba(0, 0, 0, 0.00), -10px 28px 29px 0px rgba(0, 0, 0, 0.00), -3px 7px 16px 0px rgba(0, 0, 0, 0.00);
	}
	:global(.card[data-dragging="true"]) {
		transform: translateX(var(--card-x)) translateY(var(--card-y)) rotate(var(--card-r)) scale(var(--scale));
		transition: background-color 0.12s ease-out, color 0.12s ease-out;
	}

	:global(.card[data-dragging="false"]) {
		transition: box-shadow 0.2s, transform 0.25s ease-out, top 0.25s ease-out 0.3s, opacity 0.3s ease-out, background-color 0.12s ease-out, color 0.12s ease-out;
		transform: translateX(var(--card-x)) translateY(var(--card-y)) rotate(var(--card-r)) scale(var(--scale));
	}

	:global(.card[data-status="transition"], .card[data-status="done"]) {
		transform: scale(0.6);
		transform: translateX(calc(var(--card-x)*2)) translateY(calc(var(--card-y)*1.3 + 26vh)) rotate(calc(var(--card-r)*2.5)) scale(0.7);
		opacity: 0;
	}
	:global(.card[data-status="current"]) {
		border-color: var(--blended-color);
		box-shadow: -64px 173px 52px 0px rgba(0, 0, 0, 0.00), -41px 111px 47px 0px rgba(0, 0, 0, 0.00), -23px 62px 40px 0px rgba(0, 0, 0, 0.02), -10px 28px 29px 0px rgba(0, 0, 0, 0.03), -3px 7px 16px 0px rgba(0, 0, 0, 0.03);
	}

	/* Explanation cards */
	:global(.card[data-is-explanation="true"]) {
		background-color: var(--black);
		border-color: var(--black);
	}

	:global(.card[data-drag-state="right"]:not([data-is-explanation="true"])) {
		background-color: var(--right-color-light);
		color: var(--right-color-dark);
	}

	:global(.card[data-drag-state="left"]:not([data-is-explanation="true"])) {
		background-color: var(--left-color-light);
		color: var(--left-color-dark);
	}

	:global(.card > *) {
		transition: filter 0.2s ease-out;
		filter: blur(0px);
	}

	:global(.card[data-is-explanation="true"] > *) {
		color: white;
	}

	:global(.card[data-show="false"] > *) {
		filter: blur(10px);
	}
</style>