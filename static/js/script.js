function openCvReady() {
  cv["onRuntimeInitialized"] = () => {
    let video = document.getElementById("cam_input"); // video is the id of video tag
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then(function (stream) {
        video.srcObject = stream;
        video.play();
      })
      .catch(function (err) {
        console.log("An error occurred! " + err);
      });
    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    let gray = new cv.Mat();
    let cap = new cv.VideoCapture(cam_input);
    let faces = new cv.RectVector();
    let classifier = new cv.CascadeClassifier();
    let utils = new Utils("errorMessage");
    let faceCascadeFile = "/haarcascade_frontalface_default.xml"; // path to xml
    utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {
      classifier.load(faceCascadeFile); // in the callback, load the cascade from file
    });
    const faceCanvas = document.getElementById("face_canvas");
    let criminalImage = document.getElementById("criminal-image");
    let captureInterval = 17000; // 17 seconds
    let lastCaptureTime = 0;
    let isRequestPending = false;
    const FPS = 24;

    function sendFrameData(base64Data) {
      // Set the flag to indicate that an AJAX request is pending
      isRequestPending = true;

      $.ajax({
        url: `${urlAPI}/face_recognition/`,
        method: "POST",
        data: { frame: base64Data },
        success: function (data) {
          console.log("Face recognition success:", data);
          if (data != 0) {
            $("#verified").text("Verification: " + data[0].verified);
            $("#distance").text("Distance: " + data[0].distance);
            $("#identity").text("Identity: " + data[0].identity);
            $("#threshold").text("Threshold: " + data[0].threshold);
            $("#model").text("Model: " + data[0].model);
            $("#detector_backend").text(
              "Detector Backend: " + data[0].detector_backend
            );
            $("#similarity_metric").text(
              "Similarity Metric: " + data[0].similarity_metric
            );
            $("#time").text("Time: " + data[0].time);
            criminalImage.src = `data:image/jpeg;base64,${data[0].criminal_image}`;
            criminalImage.style.display = "block";

          } else {
            $("#verified").text("Verification: ");
            $("#distance").text("Distance: ");
            $("#identity").text("Identity: ");
            $("#threshold").text("Threshold: ");
            $("#model").text("Model: ");
            $("#detector_backend").text("Detector Backend: ");
            $("#similarity_metric").text("Similarity Metric: ");
            $("#time").text("Time: ");
          }
        },
        error: function (error) {
          console.error("Face recognition error:", error);
        },
        complete: function () {
          // Reset the flag when the request is complete
          isRequestPending = false;
        },
      });
    }

    function processVideo() {
      let begin = Date.now();
      cap.read(src);
      src.copyTo(dst);
      cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
      try {
        classifier.detectMultiScale(gray, faces, 1.1, 3, 0);

        if (
          faces.size() > 0 &&
          Date.now() - lastCaptureTime > captureInterval
        ) {
          // Capture the first detected face
          let face = faces.get(0);
          let faceRegion = new cv.Mat();
          dst.roi(face).copyTo(faceRegion);

          // Resize the face region to fit the display canvas
          let resizedFace = new cv.Mat();
          cv.resize(
            faceRegion,
            resizedFace,
            new cv.Size(200, 200),
            0,
            0,
            cv.INTER_AREA
          );

          // Display the captured face on the face canvas
          cv.imshow("face_canvas", resizedFace);

          // Convert the captured face to Base64
          let base64Data = faceCanvas.toDataURL("image/jpeg");

          // Call sendFrameData with a callback function
          sendFrameData(base64Data) 
            // Handle the processed data or trigger any additional actions
            // You can capture another image here if needed
         

          // Release Mats
          faceRegion.delete();
          resizedFace.delete();

          // Update the last capture time
          lastCaptureTime = Date.now();
        }
      } catch (err) {
        console.log(err);
      }
      for (let i = 0; i < faces.size(); ++i) {
        let face = faces.get(i);
        let point1 = new cv.Point(face.x, face.y);
        let point2 = new cv.Point(face.x + face.width, face.y + face.height);
        cv.rectangle(dst, point1, point2, [0, 255, 0, 255]);
      }
      cv.imshow("canvas_output", dst);
      // schedule next one.
      let delay = 1000 / FPS - (Date.now() - begin);
      setTimeout(processVideo, delay);
    }

    // schedule first one.
    setTimeout(processVideo, 8000);
  };
}
