<script>
	export let isCurrent;
	export let isExplanation = false;
	export let isPriorityChoice = false;
</script>

<p class="card" data-show="{isCurrent}" data-dragging="false" data-status="{isCurrent === true ? 'current' : 'waiting'}" data-is-explanation="{isExplanation}" data-is-priority="{isPriorityChoice}">
	<slot></slot>
</p>


<style>
	
</style>