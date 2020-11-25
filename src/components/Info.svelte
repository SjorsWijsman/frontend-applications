<style>
.info {
  background-color: var(--background-color-dark);
  padding: 0.8rem 1rem;
  border-radius: 0.5rem;
  opacity: 0.8;
}

.info:hover {
  opacity: 1;
}

.info::before {
  content: "!";
  background-color: var(--background-color);
  display: inline-block;
  text-align: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 1.5rem;
  margin-right: 0.5rem;
}
</style>

<p class="info">
  <slot/>
</p>
