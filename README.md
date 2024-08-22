# ImageTranslatorEXT
### OCR Image Translating
##### Just like Google Lens...

A Chrome Extension that allows you to translate any image to your desired language. *Make shopping on Taobao a little bit easier*
## Features

- Tesseract.JS integration
- Google Vision API integration (toggle between which OCR engine) (requires API Key)
- Google Translate API (requires API key)
- Translates directly on image

Simply right click on an image and request to translate the image!

## Sample Video
https://streamable.com/8f9scv

## Installation

### 1. Installing the extension
Due to hosting issues and not wanting to charge users, the best way to go about this is to allow users to self-host their OCR translator by providing API keys. Google Vision API should cost you pennies when translating and scanning, however the option to use Tesseract.JS for OCR is a free alternative, however it may not detect all texts.

#### Clone the repository and import it to Chrome
##### 1. Copying the repo
You can either clone the repository with git...
 
```sh
git clone https://github.com/realAndi/ImageTranslatedEXT
```
...[or download the zip file here!](https://github.com/realAndi/ImageTranslatedEXT/releases/)
Remember to unzip the file and leave it as a folder.
    
##### 2. Loading in the Extension
In Google Chrome, navigate to Extensions and click on "Load Unpacked", here you can select the folder you downloaded. Be sure you unzip it to a folder

### 2. Setting up the extension
Once loading up the extension, you will need to set up the API keys. For Google Vision and Translate, you will need to create API keys.

##### 1. Create a Google Cloud Project

- Go to the [Google Cloud Console](https://console.cloud.google.com/).
- If you don't have a Google Cloud account, you'll need to sign up for one.
- Once logged in, click on the project drop-down at the top of the page and select "New Project".
- Give your project a name and click "Create".

##### 2. Enable the APIs
- Inside your newly created project, navigate to the "APIs & Services" section in the left-hand menu, and then click "Library".
- Search for "Vision API" and click on it. Then, click "Enable" to add it to your project.
- Repeat the same process to enable the "Cloud Translation API".

##### 3. Create API Keys

- Go to the "APIs & Services" section and click on "Credentials" from the left-hand menu.
- Click on "Create Credentials" and choose "API Key".
- A new API key will be generated. You can name it something descriptive like "Vision API Key" or "Translate API Key".
- Save your API key in a secure place.

### 3. Using the Extension
When loading in the extension, you can visit the properties page by right clicking on the extension in the toolbar and selecting "Options". Here you will be able to enter your API keys.

Now when you click on the extension, a pop up will appear prompting you the OCR engine of your choice, and the desired language you wish to scan and translate from.
