import React, { Component } from "react";
import ReactCrop from "react-image-crop";

import 'react-image-crop/dist/ReactCrop.css';

const authKeys = {
    clientID: "0360d5263bb2d82",
    accessToken: "1fd243da45cd4f12f9791a5b6906ee14ca6224a0",
    tokenType: "bearer",
};

export class Upload extends Component {

    constructor() {
        super();
        this.state = {
            src: null,
            inValidImage: false,
            crop: [{
                width: (755 / 10.24),
                height: (450 / 10.24),
                x: 0,
                y: 0,
                indx: 0
            }, {
                width: (365 / 10.24),
                height: (450 / 10.24),
                x: 0,
                y: 0,
                indx: 1
            }, {
                width: (365 / 10.24),
                height: (212 / 10.24),
                x: 0,
                y: 0,
                indx: 2
            }, {
                width: (380 / 10.24),
                height: (380 / 10.24),
                x: 0,
                y: 0,
                indx: 3
            }],
            croppedImageUrls: ["", "", "", ""]
        };
    }

    onSelectFile = e => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                this.setState({ src: reader.result }),
            );
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    getBase64Image(img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL("image/png");
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }

    async uploadImage() {
        const { croppedImageUrls } = this.state
        croppedImageUrls
            .filter(blobUrl => blobUrl !== '')
            .forEach(async (blobUrl, index) => {

                var image = this.getBase64Image(document.getElementById(("croppedImage" + index)));
                var formData = new FormData()
                formData.append('type', 'file')
                formData.append('image', image)
                var response = await fetch('https://api.imgur.com/3/image', {
                    method: 'POST',
                    headers: {
                        Authorization: "Bearer " + authKeys.accessToken,
                    },
                    body: formData
                });
                var json = await response.json();
                window.open(json.data.link);
            })
    }
    onImageLoaded = (image, pixelCrop) => {
        if (image.naturalWidth !== 1024 || image.naturalHeight !== 1024) {
            this.setState({
                src: "",
                inValidImage: true
            });
        } else {
            this.setState({
                inValidImage: false
            });
            this.imageRef = image;
        }
    };

    onCropComplete = (cropped, pixelCrop) => {
        this.makeClientCrop(cropped, pixelCrop);
    };

    onCropChange = (cropped) => {
        var ind = cropped.indx;
        var newState = this.state.crop;
        newState[ind] = cropped;
        this.setState({ crop: newState });
    };

    async makeClientCrop(crop, pixelCrop) {
        if (this.imageRef && crop.width && crop.height) {
            const croppedImageUrl = await this.getCroppedImg(
                this.imageRef,
                pixelCrop,
                "newFile" + crop.indx + ".jpeg",
            );
            var newCroppedImageUrls = this.state.croppedImageUrls;
            newCroppedImageUrls[crop.indx] = croppedImageUrl;
            this.setState({ croppedImageUrls: newCroppedImageUrls });
        }
    }


    getCroppedImg(image, pixelCrop, fileName) {
        const canvas = document.createElement('canvas');
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height,
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    console.error('Canvas is empty');
                    return;
                }
                blob.name = fileName;
                window.URL.revokeObjectURL(this.fileUrl);
                this.fileUrl = window.URL.createObjectURL(blob);
                resolve(this.fileUrl);
            }, 'image/jpeg');
        });
    }

    render() {
        const { crop, croppedImageUrls, src, inValidImage } = this.state;

        return (
            <div className="App">
                <div>
                    <input type="file" onChange={this.onSelectFile} accept="image/*" />
                </div>

                {inValidImage && (<h2>Please select an image of resolution 1024*1024</h2>)}
                {src && (<h2>Please click on the crops to confirm the crop size</h2>)}
                {[0, 1, 2, 3].map((i) => {
                    return (
                        <div key={"reactcrop" + i} style={{ marginTop: "20px" }}>
                            <div>
                                {src && (
                                    <ReactCrop
                                        src={src}
                                        crop={crop[i]}
                                        onImageLoaded={this.onImageLoaded}
                                        onComplete={this.onCropComplete}
                                        onChange={this.onCropChange}
                                        className="originalImage"
                                    />
                                )}
                            </div>
                            <div style={{ marginBottom: "20px" }}>
                                {
                                    croppedImageUrls[i] && (<div>
                                        <h2>Cropped Image{i + 1}</h2>
                                        <img alt="Crop" style={{ width: '360px' }} src={croppedImageUrls[i]} id={"croppedImage" + i} />
                                    </div>
                                    )
                                }
                            </div>
                        </div>);
                })}
                {src && <button onClick={() => this.uploadImage()} className="btn btn-primary">Upload Image</button>}
            </div>
        );
    }
}
