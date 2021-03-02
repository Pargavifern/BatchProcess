import { LightningElement, api, track } from 'lwc';
import getProfilePictureId from '@salesforce/apex/customProfilePictureController.getProfilePictureId';
import updateProfilePictureId from '@salesforce/apex/customProfilePictureController.updateProfilePictureId';
import getPlaceholderUrl from '@salesforce/apex/customProfilePictureController.getPlaceholderUrl';
import colourimage from '@salesforce/resourceUrl/colourimage';
export default class customProfilePicture extends LightningElement {
    @api recordId;
    @api objectApiName;

    @track imageSrc = "";
    @track basePath = "/sfc/servlet.shepherd/document/download/";
    @track profilePictureId;
    @track template;
    @track gender;
    @track disableDeleteicon = true
    allowedFileTypes = [".png", ".jpg", ".jpeg","svg"];

    connectedCallback() {
        this.fetchImage();
        this.template = this.objectApiName;

    }

    fetchImage() {
        getProfilePictureId({ id: this.recordId, objApiName: this.objectApiName }).then(data => {
            if (data !== "" && data !== undefined) {
                this.error = undefined;

                this.profilePictureId = data;
                this.imageSrc = this.basePath + data;
                this.disableDeleteicon = false;
            } else {
                this.setAvatar()();
            }
        }).catch(error => {
            this.error = error;
            this.setAvatar();
        });
    }

    setAvatar() {
        getPlaceholderUrl({objApiName: this.objectApiName }).then(url => {
            this.imageSrc = url;
        });
        this.disableDeleteicon = true;
    }

    handleUploadFinished(event) {
        this.imageSrc = "";
        const uploadedFiles = event.detail.files;

        this.imageSrc = this.basePath + uploadedFiles[0].documentId;
        this.disableDeleteicon = false;
        this.updateProfilePicture(uploadedFiles[0].documentId);

    }

    updateProfilePicture(documentId) {
        updateProfilePictureId({ id: this.recordId, documentId: documentId, objApiName: this.objectApiName }).catch(error => {
            this.error = error;
        });
    }

    deleteProfilePicture() {
        if (this.profilePictureId || this.profilePictureId !== "") {
            this.setAvatar();
            this.updateProfilePicture("");

        }
    }

    setDefaultImage() {
        if (this.imageSrc !== "") {
            this.setAvatar();
        }
    }

    get acceptedFormats() {
        return ['.png', '.jpg', '.jpeg'];
    }
}