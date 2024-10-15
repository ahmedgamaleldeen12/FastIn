import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from 'src/app/core/http/http.service';
import * as faceapi from 'face-api.js';

@Injectable({
  providedIn: 'root',
})
export class FaceRegistrationService extends HttpService {
  private modelsLoaded = false;

  get baseUrl(): string {
    return 'MobileUserFaceRegistration/';
  }

  constructor() {
    super();
    this.loadModels();
  }

  MobileUserFaceIdRegistration(model: any): Observable<any> {
    return this.postReqWithUrl(this.serverUrl + 'MobileUserFaceRegistration/CreateEmployeeRegisteration',model);
  }

  private async loadModels() {
    if (!this.modelsLoaded) {
      const modelUrl = 'https://tams.apexunited.net:8021/AumApi/Files/modals';
      await faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl);
      await faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl);
      await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);
      await faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl);
      this.modelsLoaded = true;
    }
  }


  async getOneFaceCropped(ImageBase64: string): Promise<string | number> {
    const img = new Image();
    img.src = ImageBase64;
    try {
      await img.decode();
    } catch (e) {
      console.error('Error decoding image', e);
      throw new Error('Unable to decode the image');
    }

    const FacesCount = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
    if (FacesCount.length === 1) {
      return this.cropFace(img);
    } else {
      return FacesCount.length;
    }
  }

  async getOneFaceCroppedForLogs(ImageBase64: string): Promise<string | number> {
    const img = new Image();
    img.src = ImageBase64;
    try {
      await img.decode();
    } catch (e) {
      console.error('Error decoding image', e);
      throw new Error('Unable to decode the image');
    }

    const FacesCount = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
    if (FacesCount.length === 1) {
      return ImageBase64
    } else {
      return FacesCount.length
    }
  }

  async CropBase64(ImageBase64: string): Promise<string> {
    debugger
    const img = new Image();
    img.src = ImageBase64;

    try {
      await img.decode();
    } catch (e) {
      console.error('Error decoding image', e);
      throw new Error('Unable to decode the image');
    }

    const faceAIData = await faceapi.detectSingleFace(img,new faceapi.SsdMobilenetv1Options({ minConfidence: 0.6 })).withFaceLandmarks();

    if (!faceAIData) {
      throw new Error('No face detected');
    }

    const box = faceAIData!.detection.box;

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = box.width;
    croppedCanvas.height = box.height;
    const ctx = croppedCanvas.getContext('2d');

    ctx!.imageSmoothingEnabled = true;
    ctx!.imageSmoothingQuality = 'high';

    ctx!.drawImage(
      img,
      box.x,
      box.y,
      box.width,
      box.height,
      0,
      0,
      box.width,
      box.height
    );

    return croppedCanvas.toDataURL();
  }

  async cropFace(img: HTMLImageElement): Promise<string> {
    const faceAIData = await faceapi.detectSingleFace(img,new faceapi.SsdMobilenetv1Options({ minConfidence: 0.6 })).withFaceLandmarks();

    if (!faceAIData) {
      throw new Error('No face detected');
    }

    const box = faceAIData!.detection.box;

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = box.width;
    croppedCanvas.height = box.height;
    const ctx = croppedCanvas.getContext('2d');

    ctx!.imageSmoothingEnabled = true;
    ctx!.imageSmoothingQuality = 'high';

    ctx!.drawImage(
      img,
      box.x,
      box.y,
      box.width,
      box.height,
      0,
      0,
      box.width,
      box.height
    );

    return croppedCanvas.toDataURL();
  }
}
