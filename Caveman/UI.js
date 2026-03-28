function drawHUD(time) {
  fill(0);
  textSize(24);
  text(`Time to Evolve: ${time}`, 20, 30);

  fill(200);
  rect(20, 50, 200, 20);
}