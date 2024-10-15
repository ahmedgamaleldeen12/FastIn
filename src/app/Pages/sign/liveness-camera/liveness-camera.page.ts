import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import * as faceapi from 'face-api.js';
import { FaceApiService } from 'src/app/shared/services/face-api.service';

@Component({
  selector: 'app-liveness-camera',
  templateUrl: './liveness-camera.page.html',
  styleUrls: ['./liveness-camera.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LivenessCameraPage implements OnInit {
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('overlayCanvas') overlayCanvas!: ElementRef;

  result: string = '';
  isBlinking: boolean = false;
  previousLandmarks: any = null;
  previousFaceBox: any = null;
  isDetecting: boolean = false;
  blinkThreshold: number = 0.15;
  headMovementThreshold: number = 3;
  previousNosePositions: { [key: number]: any } = {};
  detectionInterval: number = 1000;

  imageBase64!: string;
  detectionIntervalId: any;
  private readonly router = inject(Router);
  private readonly service = inject(FaceApiService);
  
  private modelsLoaded = false;
  constructor() { }

  async ngOnInit() {
    await this.setupCamera();
    await this.loadModels();
    this.detectionIntervalId = setInterval(() => this.detectFace(), 1000);
  }
  ngOnDestroy() {
    this.stopCameraAndInterval();
  }

  async setupCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = this.videoElement.nativeElement;
      video.srcObject = stream;
      video.play();
    } catch (error) {
      console.error('Error accessing the camera:', error);
      alert('Could not access the camera. Please check your device settings.');
    }
  }


  private async loadModels() {
    if (!this.modelsLoaded) {
      const URL = 'https://tams.apexunited.net:8021/AumApi/Files/modals'
      await faceapi.nets.ssdMobilenetv1.loadFromUri(URL)
      await faceapi.nets.tinyFaceDetector.loadFromUri(URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(URL);
      this.modelsLoaded = true
    }
  }

  async detectFace() {
    if (this.isDetecting) return;
    this.isDetecting = true;

    const video = this.videoElement.nativeElement;
    const canvas = this.overlayCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (detection) {
      const box = detection.detection.box;
      const isReal = this.detectLiveness(detection);

      ctx.strokeStyle = isReal ? 'red' : 'green';
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      ctx.font = '16px Arial';
      ctx.fillStyle = isReal ? 'red' : 'green';
      // ctx.fillText(isReal ? 'Real' : 'Fake', box.x + 10, box.y + 25);

      this.result = isReal ? 'Real face detected' : 'Fake face detected';

      if (isReal) {
        this.captureFrame(video, canvas);

        this.stopCameraAndInterval();
        if(this.imageBase64){
          this.service.capturedImage = this.imageBase64;
          this.router.navigate(['/sign']);
        }else{
          this.ngOnInit();
        }
      }
    } else {
      this.result = 'No face detected';
    }

    this.isDetecting = false;
  }

  captureFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.imageBase64 = canvas.toDataURL('image/png'); // Convert the canvas to a base64 image
  }

  detectLiveness(detection: any): boolean {
    const landmarks = detection.landmarks;

    // Eye blink detection
    // const leftEye = detection.faceLandmarks.getLeftEye();
    // const rightEye = detection.faceLandmarks.getRightEye();
    // const leftEyeOpen = this.isEyeOpen(leftEye);
    // const rightEyeOpen = this.isEyeOpen(rightEye);

    // if (!leftEyeOpen && !rightEyeOpen) {
    //   this.isBlinking = true;
    // } else if (this.isBlinking && (leftEyeOpen || rightEyeOpen)) {
    //   this.isBlinking = false;
    //   return true; // Liveness detected by blink
    // }

    // Head movement detection
    let headMoved = false;
    if (this.previousLandmarks) {
      headMoved = this.hasHeadMoved(landmarks, this.previousLandmarks);
      this.previousLandmarks = landmarks;
    } else {
      this.previousLandmarks = landmarks;
    }

    // Frame-to-frame consistency check
    const currentFaceBox = detection.detection.box;
    const isFrameConsistent = this.checkFrameConsistency(currentFaceBox);

    // Additional checks
    const { happy, sad, neutral } = detection.expressions;
    const isExpressionPresent = happy > 0.5 || sad > 0.5 || neutral > 0.5;

    // Use recent nose positions to detect motion
    const currentNosePosition = landmarks.getNose()[0];
    const isNoseMoving = this.isNoseMoving(currentNosePosition);

    // Combine checks for better accuracy
    return (isExpressionPresent || isNoseMoving || this.isBlinking) && (headMoved || this.isBlinking) && isFrameConsistent;
  }

  stopCameraAndInterval() {
    if (this.detectionIntervalId) {
      clearInterval(this.detectionIntervalId);
    }

    const video = this.videoElement.nativeElement;
    const stream = video.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track: MediaStreamTrack) => track.stop());
      video.srcObject = null;
    }
  }

  checkFrameConsistency(currentBox: any): boolean {
    // Implement logic to compare currentBox with previous frame's box
    // For example, check if the movement is within an expected range
    const movementThreshold = 30; // Adjust as needed
    if (this.previousFaceBox) {
      const dx = currentBox.x - this.previousFaceBox.x;
      const dy = currentBox.y - this.previousFaceBox.y;
      const distanceMoved = Math.sqrt(dx * dx + dy * dy);

      // If the movement is too large, it could indicate that the entire image is being moved
      if (distanceMoved > movementThreshold) {
        return false; // Likely fake if there's too much movement
      }
    }

    this.previousFaceBox = currentBox;
    return true; // Frame is consistent
  }

  isEyeOpen(eyeLandmarks: any): boolean {
    const horizontalDist = this.distance(eyeLandmarks[0], eyeLandmarks[3]);
    const verticalDist1 = this.distance(eyeLandmarks[1], eyeLandmarks[5]);
    const verticalDist2 = this.distance(eyeLandmarks[2], eyeLandmarks[4]);

    const eyeAspectRatio = (verticalDist1 + verticalDist2) / (2.0 * horizontalDist);
    return eyeAspectRatio > this.blinkThreshold;
  }

  hasHeadMoved(currentLandmarks: any, previousLandmarks: any): boolean {
    const noseCurrent = currentLandmarks.getNose();
    const nosePrevious = previousLandmarks.getNose();

    const distanceMoved = this.distance(noseCurrent[0], nosePrevious[0]);
    return distanceMoved > this.headMovementThreshold;
  }

  isNoseMoving(currentPosition: any): boolean {
    const recentPositions = Object.values(this.previousNosePositions);
    const movementThreshold = 5; // Adjust as needed

    if (recentPositions.length === 0) {
      this.previousNosePositions[Date.now()] = currentPosition;
      return false;
    }

    const lastPosition = recentPositions[recentPositions.length - 1];
    const distanceMoved = this.distance(currentPosition, lastPosition);

    if (distanceMoved > movementThreshold) {
      this.previousNosePositions[Date.now()] = currentPosition;
      return true;
    }

    // Maintain a limited number of recent positions
    if (Object.keys(this.previousNosePositions).length > 5) {
      const oldestKey = Math.min(...Object.keys(this.previousNosePositions).map(Number));
      delete this.previousNosePositions[oldestKey];
    }

    return false;
  }

  distance(point1: any, point2: any): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

}


