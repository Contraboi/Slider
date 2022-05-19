const sliderContainers = document.querySelectorAll(".slider-container");

function slide(slider, items) {
  let posX1 = 0,
    posX2 = 0,
    slideWidth = items.querySelectorAll(".slide")[0].offsetWidth,
    allowShift = true,
    userInteracting = false,
    index = parseInt(
      getComputedStyle(items).getPropertyValue("--slider-index")
    ),
    itemsPerScreen = items.dataset.itemsPerScreen,
    itemCount = items.children.length,
    progressBarItemCount,
    autoPlayValue = items.dataset.autoPlay,
    dotsValue = items.dataset.dots,
    arrowsValue = items.dataset.arrows;
  items.style.setProperty("--items-per-screen", itemsPerScreen);
  progressBarItemCount = Math.ceil(itemCount / itemsPerScreen);

  //Add Left and Right arrow if arrowsValue is yes
  if (arrowsValue) {
    const nextElement = document.createElement("a");
    nextElement.classList.add("control");
    nextElement.classList.add("next");

    const prevElement = document.createElement("a");
    prevElement.classList.add("control");
    prevElement.classList.add("prev");

    slider.appendChild(nextElement);
    slider.appendChild(prevElement);

    // Click events
    prevElement.addEventListener("click", function () {
      shiftSlide(-1);
    });
    nextElement.addEventListener("click", function () {
      shiftSlide(1);
    });
  }

  //Add progress bar if dotsValue is yes
  if (dotsValue) {
    const progressBarElement = document.createElement("div");
    progressBarElement.classList.add("progress-bar");
    slider.appendChild(progressBarElement);

    const throttleProgressBar = throttle(() => {
      progressBarElement(calculateProgressBar);
    }, 250);
    window.addEventListener("resize", throttleProgressBar);

    calculateProgressBar(progressBarElement);

    function calculateProgressBar(progressBar) {
      progressBar.innerHTML = "";
      let sliderIndex = parseInt(
        getComputedStyle(items).getPropertyValue("--slider-index")
      );
      progressBarItemCount = Math.ceil(itemCount / itemsPerScreen);

      if (sliderIndex >= progressBarItemCount) {
        slider.style.setProperty("--slider-index", progressBarItemCount - 1);
        sliderIndex = progressBarItemCount - 1;
      }
      for (let i = 0; i < progressBarItemCount; i++) {
        const barItem = document.createElement("div");
        barItem.classList.add("progress-item");

        if (i === sliderIndex) {
          barItem.classList.add("active");
        }
        progressBar.append(barItem);
      }
    }
  }

  // Mouse events
  items.onmousedown = dragStart;
  slider.onmouseover = mouseHover;
  slider.onmouseleave = mouseExit;

  // Touch events
  items.addEventListener("touchstart", dragStart);
  items.addEventListener("touchend", dragEnd);

  function mouseHover() {
    userInteracting = true;
    console.log(userInteracting);
  }
  function mouseExit() {
    userInteracting = false;
    console.log(userInteracting);
  }

  function dragStart(e) {
    e = e || window.event;
    userInteracting = true;
    if (e.type == "touchstart") {
      posX1 = e.changedTouches[0].clientX;
    } else {
      posX1 = e.clientX;
      document.onmouseup = dragEnd;
    }
  }

  function dragEnd(e) {
    userInteracting = false;
    if (e.type == "touchend") {
      posX2 = e.changedTouches[0].clientX;
    } else {
      posX2 = e.clientX;
    }

    const movedBy = (posX1 - posX2) / slideWidth;

    if (movedBy > 0.3) {
      shiftSlide(1, "drag");
    } else if (movedBy < -0.3) {
      shiftSlide(-1, "drag");
    }
    document.onmouseup = null;
    document.onmousemove = null;
  }

  function shiftSlide(dir) {
    items.classList.add("shifting");
    const dotsValue = items.dataset.dots;
    let progressBar;

    if (dotsValue) {
      progressBar = slider.querySelector(".progress-bar");
    }
    if (allowShift) {
      if (dir == 1) {
        if (index + 1 >= progressBarItemCount) {
          items.style.setProperty("--slider-index", 0);
          if (dotsValue) {
            progressBar.children[index].classList.remove("active");
            progressBar.children[0].classList.add("active");
          }
          index = 0;
        } else {
          items.style.setProperty("--slider-index", index + 1);
          if (dotsValue) {
            progressBar.children[index].classList.remove("active");
            progressBar.children[index + 1].classList.add("active");
          }

          index += 1;
        }
      } else if (dir == -1) {
        if (index - 1 < 0) {
          items.style.setProperty("--slider-index", progressBarItemCount - 1);
          if (dotsValue) {
            progressBar.children[index].classList.remove("active");
            progressBar.children[progressBarItemCount - 1].classList.add(
              "active"
            );
          }
          index = progressBarItemCount - 1;
        } else {
          items.style.setProperty("--slider-index", index - 1);
          if (dotsValue) {
            progressBar.children[index].classList.remove("active");
            progressBar.children[index - 1].classList.add("active");
          }
          index -= 1;
        }
      }
    }
  }

  function autoPlay() {
    shiftSlide(1);
  }

  const interval = setInterval(function () {
    if (!userInteracting && !isNaN(autoPlayValue)) {
      autoPlay();
    } else if (isNaN(autoPlayValue)) clearInterval(interval);
  }, autoPlayValue); //run
}

sliderContainers.forEach((sliderContainer) => {
  const slider = sliderContainer.querySelector("#slider");
  slide(sliderContainer, slider);
});
function throttle(cb, delay = 1000) {
  let shouldWait = false;
  let waitingArgs;
  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false;
    } else {
      cb(...waitingArgs);
      waitingArgs = null;
      setTimeout(timeoutFunc, delay);
    }
  };

  return (...args) => {
    if (shouldWait) {
      waitingArgs = args;
      return;
    }

    cb(...args);
    shouldWait = true;
    setTimeout(timeoutFunc, delay);
  };
}
