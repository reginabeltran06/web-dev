# Drumin Project

In this exercise, we will be creating an webpage that will simulate playing a set of drums. The drums will be associated with a click on the interfaces and with the keyboard. The goal of the task is to get further acquainted with JS functions.

## Instructions

- Create a js file to host your code and link it with the html.
- Using css change the image of the buttons to the once provided in the images folder.
- Create a function with an alert that should show the key selected in the alert when pressing the button.
    - Add a listener to the button with the **addEventListener** method and call the function we just created.
    - Make sure that you don't hard code the selection of the elements and rather use a loop structure.
### Audio
- Add audio to each button 
- To play audios, you can call this code
```js
var crash = new Audio('sounds/crash.mp3');
crash.play();
```
- These should be the reference of sounds to keys
    - **w:** tom1
    - **a:** tom2
    - **s:** tom3
    - **d:** tom4
    - **j:** snare
    - **k:** crash
    - **l:** kick-bass
- Add animation to buttons, change the style of the letter when the button is pressed and then revert it back to the original
    - Use the _pressed_ style already provided in the css file
    - To revert back after assigning the style, check the **setTimeout** function that is core for js.
    - Make sure that the animation matches the sound playing.
- Add a **keypress** event listener for the drums and make sure that the same behavior is achieved, that is, the sound and the animation.

---
[Sample solution](https://gist.github.com/gcastillo56/6b3277396b2ed25c90e8f361358452b1)