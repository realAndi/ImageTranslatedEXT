let translateFrom, translateTo;
let debugMode = false;

function loadSettings() {
    chrome.storage.sync.get(['translateFrom', 'translateTo'], function(items) {
        translateFrom = items.translateFrom || 'auto';
        translateTo = items.translateTo || 'en';
        debugMode = items.debugMode || false;
        debugLog(`Language settings loaded: from ${translateFrom} to ${translateTo}`);
    });
}

// Load settings when the script is first injected
loadSettings();

function debugLog(...args) {
    if (debugMode) {
        console.log("[DEBUG]", ...args);
    }
}

    function loadTesseract() {
        return new Promise((resolve, reject) => {
            if (window.Tesseract) {
                debugLog('Tesseract.js already loaded');
                resolve(window.Tesseract);
            } else {
                const script = document.createElement('script');
                script.src = chrome.runtime.getURL('libs/tesseract.min.js');
                script.onload = () => {
                    debugLog('Tesseract.js loaded');
                    resolve(window.Tesseract);
                };
                script.onerror = (error) => {
                    console.error('Error loading Tesseract.js:', error);
                    reject(error);
                };
                document.head.appendChild(script);
            }
        });
    }

    // Function to get image blob from URL
    async function getImageBlob(url) {
        debugLog('Fetching image from URL:', url);
        const response = await fetch(url);
        const blob = await response.blob();
        debugLog('Fetched image blob:', blob);
        return blob;
    }

    // Function to create image from blob
    function createImageFromBlob(blob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                debugLog('Image created from blob:', img);
                resolve(img);
            };
            img.onerror = (error) => {
                console.error('Error creating image from blob:', error);
                reject(error);
            };
            img.src = URL.createObjectURL(blob);
        });
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => document.body.removeChild(toast), 500);
        }, 3000);
    }

    function createLoadingOverlay(targetElement) {
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1000';
    
        const spinner = document.createElement('div');
        spinner.innerHTML = `
            <div class="container">
                <div class="half"></div>
                <div class="half"></div>
            </div>
        `;
        spinner.innerHTML += `
            <style>
                .container {
                    --uib-size: 45px;
                    --uib-color: black;
                    --uib-speed: 1.75s;
                    --uib-bg-opacity: .1;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    height: var(--uib-size);
                    width: var(--uib-size);
                    transform: rotate(45deg);
                    animation: rotate calc(var(--uib-speed) * 2) ease-in-out infinite;
                }
                .half {
                    --uib-half-size: calc(var(--uib-size) * 0.435);
                    position: absolute;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: var(--uib-half-size);
                    height: var(--uib-half-size);
                    overflow: hidden;
                    isolation: isolate;
                }
                .half:first-child {
                    top: 8.25%;
                    left: 8.25%;
                    border-radius: 50% 50% calc(var(--uib-size) / 15);
                }
                .half:last-child {
                    bottom: 8.25%;
                    right: 8.25%;
                    transform: rotate(180deg);
                    align-self: flex-end;
                    border-radius: 50% 50% calc(var(--uib-size) / 15);
                }
                .half:last-child::after {
                    animation-delay: calc(var(--uib-speed) * -1);
                }
                .half::before {
                    content: '';
                    height: 100%;
                    width: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    background-color: var(--uib-color);
                    opacity: var(--uib-bg-opacity);
                    transition: background-color 0.3s ease;
                }
                .half::after {
                    content: '';
                    position: relative;
                    z-index: 1;
                    display: block;
                    background-color: var(--uib-color);
                    height: 100%;
                    transform: rotate(45deg) translate(-3%, 50%) scaleX(1.2);
                    width: 100%;
                    transform-origin: bottom right;
                    border-radius: 0 0 calc(var(--uib-size) / 20) 0;
                    animation: flow calc(var(--uib-speed) * 2) linear infinite both;
                    transition: background-color 0.3s ease;
                }
                @keyframes flow {
                    0% { transform: rotate(45deg) translate(-3%, 50%) scaleX(1.2); }
                    30% { transform: rotate(45deg) translate(115%, 50%) scaleX(1.2); }
                    30.001%, 50% { transform: rotate(0deg) translate(-85%, -85%) scaleX(1); }
                    80%, 100% { transform: rotate(0deg) translate(0%, 0%) scaleX(1); }
                }
                @keyframes rotate {
                    0%, 30% { transform: rotate(45deg); }
                    50%, 80% { transform: rotate(225deg); }
                    100% { transform: rotate(405deg); }
                }
            </style>
        `;
    
        overlay.appendChild(spinner);
    
        // Create a wrapper div to contain both the image and the overlay
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
    
        // Insert the wrapper before the target element in the DOM
        targetElement.parentNode.insertBefore(wrapper, targetElement);
    
        // Move the target element into the wrapper
        wrapper.appendChild(targetElement);
    
        // Add the overlay to the wrapper
        wrapper.appendChild(overlay);
    
        return overlay;
    }
    
    function removeLoadingOverlay(overlay) {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }

    
    // Function to extract text using selected OCR engine
    async function extractTextFromImage(imageBlob) {
        const { ocrEngine } = await chrome.storage.sync.get('ocrEngine');
        if (ocrEngine === 'tesseract') {
            return extractTextUsingTesseract(imageBlob);
        } else if (ocrEngine === 'googleVision') {
            return extractTextUsingGoogleVision(imageBlob);
        } else {
            throw new Error('Invalid OCR engine selected');
        }
    }

    // Function to extract text using Tesseract
    async function extractTextUsingTesseract(imageBlob) {
        try {
            const Tesseract = await loadTesseract();
            const worker = await Tesseract.createWorker("chi_sim");
            const { data } = await worker.recognize(imageBlob);
            debugLog('Recognition result:', data.text);
            await worker.terminate();
            debugLog('Worker terminated');

            if (!data || !Array.isArray(data.lines)) {
                console.error('Unexpected result structure:', data);
                return [];
            }

            const lines = data.lines.map(line => ({
                text: line.text,
                bbox: line.bbox
            }));

            debugLog('OCR Lines:', lines);
            return lines;
        } catch (error) {
            console.error('Error in extractTextUsingTesseract:', error);
            return [];
        }
    }

    // Function to extract text using Google Vision API
    async function extractTextUsingGoogleVision(imageBlob) {
        try {
            const { visionApiKey } = await chrome.storage.sync.get('visionApiKey');
            if (!visionApiKey) {
                showToast('Google Cloud Vision API key is not set');
                throw new Error('Google Cloud Vision API key is missing');
            }
    
            let base64Image = await blobToBase64(imageBlob);
    
            const url = `https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`;
    
            const requestBody = {
                requests: [{
                    image: {
                        content: base64Image
                    },
                    features: [{
                        type: 'DOCUMENT_TEXT_DETECTION',
                        model: 'builtin/latest'
                    }],
                    imageContext: {
                        languageHints: ['zh']
                    }
                }]
            };
    
            debugLog('Vision API request body:', JSON.stringify(requestBody));
    
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Vision API error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
    
            debugLog('Vision API response:', JSON.stringify(data));
    
            if (data.error) {
                console.error('Vision API error:', data.error);
                throw new Error(`API error: ${data.error.message}`);
            }
    
            if (!data.responses || !data.responses[0] || !data.responses[0].fullTextAnnotation) {
                console.error('Unexpected result structure:', data);
                return [];
            }
    
            const img = await createImageFromBlob(imageBlob);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
    
            const textAnnotations = data.responses[0].fullTextAnnotation;
            if (!textAnnotations) {
                showToast('No text annotations found');
                return [];
            }
    
            const lines = textAnnotations.pages[0].blocks
                .flatMap(block => block.paragraphs)
                .flatMap(paragraph => paragraph.words)
                .reduce((acc, word) => {
                    const lastLine = acc[acc.length - 1];
                    const wordBox = word.boundingBox.vertices;
                    const wordText = word.symbols.map(s => s.text).join('');
    
                    if (!lastLine || Math.abs(wordBox[0].y - lastLine.bbox.y0) > 5) {
                        acc.push({
                            text: wordText,
                            bbox: {
                                x0: Math.min(...wordBox.map(v => v.x)),
                                y0: Math.min(...wordBox.map(v => v.y)),
                                x1: Math.max(...wordBox.map(v => v.x)),
                                y1: Math.max(...wordBox.map(v => v.y))
                            }
                        });
                    } else {
                        lastLine.text += ' ' + wordText;
                        lastLine.bbox.x1 = Math.max(lastLine.bbox.x1, ...wordBox.map(v => v.x));
                        lastLine.bbox.y1 = Math.max(lastLine.bbox.y1, ...wordBox.map(v => v.y));
                    }
                    return acc;
                }, []);
    
            debugLog('Extracted lines:', lines);
            return lines;
        } catch (error) {
            console.error('Error in extractTextUsingGoogleVision:', error);
            return [];
        }
    }
    
    // Helper function to convert blob to base64
    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    try {
                        const base64data = reader.result.split(',')[1];
                        resolve(base64data);
                    } catch (error) {
                        console.error('Error splitting reader.result:', error);
                        reject(new Error('Failed to process base64 data'));
                    }
                } else {
                    reject(new Error('Failed to read blob'));
                }
            };
            reader.onerror = (error) => {
                console.error('Error reading blob:', error);
                reject(new Error('Failed to read blob'));
            };
            reader.readAsDataURL(blob);
        });
    }

    function sampleBackgroundColor(ctx, x0, y0, x1, y1) {
        const defaultColor = { r: 255, g: 255, b: 255, a: 1 };
        try {
            // Ensure all values are valid numbers and within canvas bounds
            const canvasWidth = ctx.canvas.width;
            const canvasHeight = ctx.canvas.height;
            x0 = Math.max(0, Math.min(Math.round(x0) || 0, canvasWidth - 1));
            y0 = Math.max(0, Math.min(Math.round(y0) || 0, canvasHeight - 1));
            x1 = Math.max(0, Math.min(Math.round(x1) || canvasWidth, canvasWidth));
            y1 = Math.max(0, Math.min(Math.round(y1) || canvasHeight, canvasHeight));
    
            const width = x1 - x0;
            const height = y1 - y0;
            if (width <= 0 || height <= 0) return defaultColor;
    
            // Sample colors from the edges of the bounding box
            const samples = [
                ctx.getImageData(x0, y0, 1, 1).data,
                ctx.getImageData(x1 - 1, y0, 1, 1).data,
                ctx.getImageData(x0, y1 - 1, 1, 1).data,
                ctx.getImageData(x1 - 1, y1 - 1, 1, 1).data
            ];
    
            // Calculate average color
            const avgColor = samples.reduce((acc, sample) => {
                acc.r += sample[0];
                acc.g += sample[1];
                acc.b += sample[2];
                acc.a += sample[3];
                return acc;
            }, { r: 0, g: 0, b: 0, a: 0 });
    
            return {
                r: Math.round(avgColor.r / samples.length),
                g: Math.round(avgColor.g / samples.length),
                b: Math.round(avgColor.b / samples.length),
                a: 1
            };
        } catch (error) {
            console.warn('Error sampling background color:', error);
            return defaultColor;
        }
    }

    function getContrastColor(bgColor) {
        const brightness = (bgColor.r * 299 + bgColor.g * 587 + bgColor.b * 114) / 1000;
        return brightness > 128 ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
    }

    function sampleTextColor(ctx, x0, y0, x1, y1) {
        try {
            const imageData = ctx.getImageData(x0, y0, x1 - x0, y1 - y0);
            const data = imageData.data;
            let r = 0, g = 0, b = 0, count = 0;
    
            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
            }
    
            return {
                r: Math.round(r / count),
                g: Math.round(g / count),
                b: Math.round(b / count)
            };
        } catch (error) {
            console.error('Error sampling text color:', error);
            return { r: 0, g: 0, b: 0 }; // Default to black if sampling fails
        }
    }

// Function to get the dominant non-background color
function getDominantTextColor(ctx, x0, y0, x1, y1) {
    const imageData = ctx.getImageData(x0, y0, x1 - x0, y1 - y0);
    const data = imageData.data;
    const colorCounts = {};
    const bgColor = sampleEdgeColor(ctx, x0, y0, x1, y1);
    const bgColorThreshold = 30;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Skip pixels that are close to the background color
        if (Math.abs(r - bgColor.r) < bgColorThreshold &&
            Math.abs(g - bgColor.g) < bgColorThreshold &&
            Math.abs(b - bgColor.b) < bgColorThreshold) {
            continue;
        }

        const colorKey = `${r},${g},${b}`;
        colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
    }

    // Find the color with the highest count
    let maxCount = 0;
    let dominantColor = { r: 0, g: 0, b: 0 };

    for (const colorKey in colorCounts) {
        if (colorCounts[colorKey] > maxCount) {
            maxCount = colorCounts[colorKey];
            const [r, g, b] = colorKey.split(',').map(Number);
            dominantColor = { r, g, b };
        }
    }

    return dominantColor;
}

function drawTranslatedTextOnImage(img, ctx, lines, translatedTexts) {
    try {
        ctx.drawImage(img, 0, 0);

        if (!Array.isArray(lines)) {
            console.error('lines is not an array:', lines);
            return;
        }

        debugLog('Number of lines:', lines.length);
        debugLog('Number of translated texts:', translatedTexts.length);

        lines.forEach((line, index) => {
            try {
                if (!line || typeof line !== 'object' || !line.bbox) {
                    console.warn(`Invalid line object at index ${index}:`, line);
                    return; // Skip this line
                }

                const { x0, y0, x1, y1 } = line.bbox;
                
                // Ensure all coordinates are valid numbers and within canvas bounds
                const ix0 = Math.max(0, Math.min(Math.round(x0) || 0, ctx.canvas.width - 1));
                const iy0 = Math.max(0, Math.min(Math.round(y0) || 0, ctx.canvas.height - 1));
                const ix1 = Math.max(0, Math.min(Math.round(x1) || ctx.canvas.width, ctx.canvas.width));
                const iy1 = Math.max(0, Math.min(Math.round(y1) || ctx.canvas.height, ctx.canvas.height));

                const width = ix1 - ix0;
                const height = iy1 - iy0;

                if (width <= 0 || height <= 0) {
                    console.warn(`Invalid bounding box dimensions for line ${index}:`, line.bbox);
                    return; // Skip this line
                }

                const translatedText = translatedTexts[index] || line.text;
                debugLog(`Line ${index} - Original: "${line.text}", Translated: "${translatedText}"`);

                // Sample background color
                const bgColor = sampleBackgroundColor(ctx, ix0, iy0, ix1, iy1);

                // Draw background
                ctx.fillStyle = `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, ${bgColor.a})`;
                ctx.fillRect(ix0, iy0, width, height);

                // Determine text color based on background brightness
                const brightness = (bgColor.r * 299 + bgColor.g * 587 + bgColor.b * 114) / 1000;
                const textColor = brightness > 128 ? 'black' : 'white';

                // Draw text
                const { lines: wrappedLines, fontSize } = wrapText(ctx, translatedText, width, height);
                
                ctx.font = `${fontSize}px Arial`;
                ctx.fillStyle = textColor;
                ctx.textBaseline = 'top';

                wrappedLines.forEach((textLine, lineIndex) => {
                    const lineHeight = fontSize * 1.2;
                    const textY = iy0 + lineIndex * lineHeight;
                    ctx.fillText(textLine, ix0, textY);
                    debugLog(`Drawing text: "${textLine}" at (${ix0}, ${textY})`);
                });

                debugLog(`Drawn text for line ${index} at (${ix0}, ${iy0}) to (${ix1}, ${iy1})`);
            } catch (error) {
                console.error(`Error processing line ${index}:`, error);
            }
        });
    } catch (error) {
        console.error('Error in drawTranslatedTextOnImage:', error);
        throw error;
    }
}

function wrapText(ctx, text, maxWidth, maxHeight) {
    let words = text.split(' ');
    let lines = [];
    let currentLine = words[0];
    let fontSize = Math.min(maxHeight, 20);
    ctx.font = `${fontSize}px Arial`;

    for (let i = 1; i < words.length; i++) {
        let word = words[i];
        let width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);

    // Adjust font size if too many lines
    while (lines.length * fontSize > maxHeight && fontSize > 8) {
        fontSize--;
        ctx.font = `${fontSize}px Arial`;
        lines = [];
        currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            let word = words[i];
            let width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
    }

    return { lines, fontSize };
}

async function translateImageText(imageUrl) {
    let imgElement = document.querySelector(`img[src="${imageUrl}"]`);
    if (!imgElement) {
        imgElement = Array.from(document.querySelectorAll('img')).find(img => img.src.includes(imageUrl));
    }
    if (!imgElement) {
        console.warn('No matching img element found for URL:', imageUrl);
        return;
    }

    const loadingOverlay = createLoadingOverlay(imgElement);

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Translation timed out')), 15000);
    });

    try {
        await Promise.race([
            (async () => {
                debugLog('Starting translation process for image:', imageUrl);
                const imageBlob = await getImageBlob(imageUrl);
                const lines = await extractTextUsingGoogleVision(imageBlob);
                debugLog('Extracted lines:', lines);

                if (!Array.isArray(lines) || lines.length === 0) {
                    throw new Error('No valid text extracted from the image');
                }

                const textsToTranslate = lines.map(line => line.text).filter(text => text && text.trim() !== '');
                if (textsToTranslate.length === 0) {
                    throw new Error('No valid text to translate');
                }

                const translatedTexts = await translateText(textsToTranslate);
                debugLog('Translated texts:', translatedTexts);


                const img = await createImageFromBlob(imageBlob);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                canvas.width = img.width;
                canvas.height = img.height;

                // Ensure the image is fully loaded before drawing
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    if (img.complete) {
                        resolve();
                    } else {
                        img.src = URL.createObjectURL(imageBlob);
                    }
                });

                ctx.drawImage(img, 0, 0);
                drawTranslatedTextOnImage(img, ctx, lines, translatedTexts);
                const newImageDataUrl = canvas.toDataURL();
                
                // Replace the original image with the translated one
                const imgElements = document.querySelectorAll(`img[src="${imageUrl}"]`);
                debugLog('Number of matching img elements:', imgElements.length);
                if (imgElements.length === 0) {
                    console.warn('No matching img elements found for URL:', imageUrl);
                    document.querySelectorAll('img').forEach(img => {
                        if (img.src.includes(imageUrl)) {
                            img.src = newImageDataUrl;
                            debugLog('Image replaced (found by partial URL match)');
                        }
                    });
                } else {
                    imgElements.forEach(imgElement => {
                        imgElement.src = newImageDataUrl;
                        debugLog('Image replaced');
                    });
                }
            })(),
            timeoutPromise
        ]);
    } catch (error) {
        console.error('Error in translateImageText:', error);
        if (error.message === 'Translation timed out') {
            showToast('Timed out, please try again or check your network connection');
        } else if (error.message === 'No valid text extracted from the image' || error.message === 'No valid text to translate') {
            showToast('No text found in the image or unable to translate');
        } else {
            showToast('An error occurred during translation. Please try again.');
        }
    } finally {
        removeLoadingOverlay(loadingOverlay);
    }
}
    // Function to translate text using Google Translate API
    async function translateText(lines) {
        const { translateApiKey } = await chrome.storage.sync.get('translateApiKey');
        if (!translateApiKey) {
            showToast('Google Translate API key is not set');
            throw new Error('Google Translate API key is missing');
        }
    
        const url = `https://translation.googleapis.com/language/translate/v2?key=${translateApiKey}`;
        const texts = lines.filter(line => line && line.trim() !== '');
        
        debugLog('Texts to translate:', texts);
    
        if (texts.length === 0) {
            console.warn('No valid text to translate');
            return [];
        }
    
        // Batch texts into groups of 128 or fewer
        const batches = [];
        for (let i = 0; i < texts.length; i += 128) {
            batches.push(texts.slice(i, i + 128));
        }
    
        let allTranslations = [];
    
        for (const batch of batches) {
            const requestBody = {
                q: batch,
                target: translateTo,
                format: 'text',
                source: translateFrom === 'auto' ? undefined : translateFrom
            };
            debugLog('Request body:', requestBody);
    
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(requestBody),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
    
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }
    
                const data = await response.json();
                
                if (data.error) {
                    console.error('API error:', data.error);
                    throw new Error(`API error: ${data.error.message}`);
                }
    
                allTranslations = allTranslations.concat(data.data.translations.map(t => t.translatedText));
            } catch (error) {
                console.error('Error in translation:', error);
                throw error;
            }
        }
    
        debugLog('All translations:', allTranslations);
    
        return allTranslations;
    }

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'settingsUpdated') {
        loadSettings();
    } else if (request.action === 'processImage') {
        debugLog('Received message to process image:', request.imageUrl);
        translateImageText(request.imageUrl);
    }
});

    debugLog('Content script loaded');