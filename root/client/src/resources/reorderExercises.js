const reorderExercises = (items, sourceIndex, destinationIndex) => {
  if (
    sourceIndex < 0 ||
    destinationIndex < 0 ||
    sourceIndex >= items.length ||
    destinationIndex >= items.length ||
    sourceIndex === destinationIndex
  ) {
    return items;
  }

  const reordered = [...items];
  const [movedExercise] = reordered.splice(sourceIndex, 1);
  reordered.splice(destinationIndex, 0, movedExercise);
  return reordered;
};

export default reorderExercises;
