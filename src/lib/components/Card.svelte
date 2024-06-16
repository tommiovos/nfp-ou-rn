<script>
	export let isCurrent;
	export let cardContent;
	export let isExplanation = false;
	export let isPriorityChoice = false;
</script>

<p class="card" data-show="{isCurrent}" data-dragging="false" data-status="{isCurrent === true ? 'current' : 'waiting'}" data-is-explanation="{isExplanation}" data-is-priority="{isPriorityChoice}">
	<slot></slot>
</p>


<style>
	:global(.card p) {
		font-size: 1.25rem;
	}
	:global(.card .text) {
		line-height: 2rem;
	}
	.card {
		--card-x: 0;
		--card-y: 0;
		--card-r: 0;
		--scale: 1;

		background-color: white;
		border: 1px solid #C5C5C5;
		border-radius: 2rem;
		position: absolute;
		top: 0;
		left: 0;
		transform: scale(var(--scale));
		padding: 2.3rem;
		transition: box-shadow 0.2s, transform 0.25s ease-out, top 0.25s ease-out 0.3s, opacity 0.3s ease-out;
		box-shadow: -64px 173px 52px 0px rgba(0, 0, 0, 0.00), -41px 111px 47px 0px rgba(0, 0, 0, 0.00), -23px 62px 40px 0px rgba(0, 0, 0, 0.00), -10px 28px 29px 0px rgba(0, 0, 0, 0.00), -3px 7px 16px 0px rgba(0, 0, 0, 0.00);
	}
	:global(.card[data-dragging="true"]) {
		transform: translateX(var(--card-x)) translateY(var(--card-y)) rotate(var(--card-r)) scale(var(--scale));
		transition: none;
	}

	:global(.card[data-dragging="false"]) {
		transition: box-shadow 0.2s, transform 0.25s ease-out, top 0.25s ease-out 0.3s, opacity 0.3s ease-out;
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
	.card[data-is-explanation="true"] {
		background-color: var(--black);
		border-color: var(--black);
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