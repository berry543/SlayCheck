/* ============================================
   FitCheck AI — Smart Outfit Analysis Engine
   No API key needed — everything runs in the browser!
   ============================================ */

(function () {
    "use strict";

    // ── DOM References ──
    const $ = (sel) => document.querySelector(sel);
    const dropZone         = $("#dropZone");
    const dropZoneContent  = $("#dropZoneContent");
    const previewArea      = $("#previewArea");
    const previewImage     = $("#previewImage");
    const removeImageBtn   = $("#removeImage");
    const fileInput        = $("#fileInput");
    const analyzeBtn       = $("#analyzeBtn");
    const resultsSection   = $("#resultsSection");
    const tryAgainBtn      = $("#tryAgainBtn");

    // Score elements
    const styleCircle      = $("#styleCircle");
    const vibeCircle       = $("#vibeCircle");
    const styleScoreValue  = $("#styleScoreValue");
    const vibeScoreValue   = $("#vibeScoreValue");
    const styleLabel       = $("#styleLabel");
    const vibeLabel        = $("#vibeLabel");

    // Detail lists
    const improvementsList = $("#improvementsList");
    const posesList        = $("#posesList");
    const pairingList      = $("#pairingList");
    const hairMakeupList   = $("#hairMakeupList");

    // ── State ──
    let currentFile = null;
    let imageData = null;

    const CIRCUMFERENCE = 2 * Math.PI * 52;

    // ══════════════════════════════════════════════
    //   SMART ANALYSIS DATA POOLS
    // ══════════════════════════════════════════════

    const STYLE_LABELS = [
        "Chic & Polished", "Casual Cool", "Streetwear Icon", "Elegant Minimalist",
        "Bold & Trendy", "Classic Sophisticate", "Boho Dreamer", "Avant-Garde",
        "Preppy Perfection", "Urban Sleek", "Modern Romantic", "Sporty Luxe",
        "Power Dressing", "Effortlessly Stylish", "Retro Vibes"
    ];

    const VIBE_LABELS = [
        "Effortlessly Cool", "Bold & Confident", "Soft & Dreamy", "Edgy & Raw",
        "Sunny & Warm", "Mysterious Allure", "Fresh & Vibrant", "Cozy & Inviting",
        "Fierce & Fearless", "Laid-back Luxe", "Ethereal Glow", "Downtown Chic",
        "Main Character Energy", "Golden Hour Aesthetic", "Clean & Crisp"
    ];

    const IMPROVEMENTS = [
        "Try tucking in the front of your top for a more structured silhouette",
        "A statement belt could define your waist and elevate the entire look",
        "Consider swapping to a monochrome color palette for a sleeker vibe",
        "Rolling up the sleeves slightly adds a relaxed, intentional touch",
        "Adding a layering piece like a blazer or cardigan would add depth",
        "Try a half-tuck to create visual interest at the waistline",
        "Switching to pointed-toe shoes would sharpen the overall look",
        "A pop of color through accessories could break up neutral tones",
        "Consider cuffing your pants to show a bit of ankle — it elongates the legs",
        "Adding a structured bag would balance out any relaxed pieces",
        "Try mixing textures — like pairing denim with silk or leather",
        "A third piece (jacket, vest, or scarf) completes the outfit composition",
        "Opting for more fitted pieces on top with loose bottoms creates balance",
        "Try replacing one basic item with a statement piece for more personality",
        "Adding minimal jewelry would polish the look without over-accessorizing",
        "Consider color-blocking with complementary tones for visual impact",
        "Swapping sneakers for loafers or boots could elevate the formality",
        "Try a French tuck — it's subtle but instantly more put-together",
        "Adding sunglasses as a hair accessory gives an effortless cool factor",
        "Consider darker tones on bottom to create a grounding effect"
    ];

    const PHOTO_POSES = [
        "Stand at a 45-degree angle with one hand in your pocket for a natural look",
        "Try the 'looking away' pose — turn your head slightly to the side, chin up",
        "Walk towards the camera mid-stride for a dynamic editorial shot",
        "Lean against a wall with one leg bent for a relaxed, cool vibe",
        "Cross your ankles while standing to create an elongated silhouette",
        "Try the 'over the shoulder' look — glance back at the camera",
        "Sit on stairs or a ledge with elbows on knees for a candid feel",
        "Hold a coffee or drink for a lifestyle-style photo that feels authentic",
        "Stand with arms crossed loosely for a confident power pose",
        "Try a mid-laugh candid — look slightly off-camera and smile naturally",
        "Place one hand on your hat or touching your hair for a fashion editorial feel",
        "Stand with feet shoulder-width apart and hands at your sides for a strong pose",
        "Try the 'stepping out' pose — one foot forward, body slightly turned",
        "Lean forward slightly with hands in pockets for a relaxed magazine vibe",
        "Look down and adjust your sleeve or collar for a candid detail shot",
        "Try a full-body mirror selfie from a slight angle for Instagram",
        "Stand in golden hour light with your back to the sun for a glow effect",
        "Pose with movement — flip your hair, swing a bag, or spin for drama",
        "Sit cross-legged on the floor for a casual editorial setup",
        "Try the 'model walk' — shoot mid-step with arms swinging naturally"
    ];

    const PAIRING_ITEMS = [
        "White leather sneakers — they go with literally everything and keep it fresh",
        "A structured crossbody bag in a neutral tone for everyday polish",
        "Layered gold necklaces to add warmth and dimension",
        "Classic aviator or oversized sunglasses for instant cool-factor",
        "A camel or black wool overcoat for cooler weather styling",
        "Chunky platform boots to add edge and height",
        "A silk scarf tied at the neck or on a bag for a Parisian touch",
        "Minimalist silver rings stacked for understated elegance",
        "A tailored blazer in a contrasting color to dress it up",
        "Canvas tote bag for a relaxed, intellectual aesthetic",
        "Ankle boots in black or tan — versatile and always stylish",
        "A baseball cap for a sporty-casual vibe",
        "Pearl earrings for timeless sophistication",
        "A leather belt with a subtle logo buckle for a designer touch",
        "Denim jacket for effortless layering in transitional weather",
        "A vintage-style watch to add a classic finishing detail",
        "Hoop earrings in gold or silver for everyday glam",
        "A beret or bucket hat for a trendy headwear statement",
        "Mid-calf socks peeking out of sneakers for streetwear edge",
        "A chain belt or body chain for an unexpected detail"
    ];

    const HAIR_MAKEUP = [
        "Slicked-back low bun — clean, polished, and lets the outfit shine",
        "Loose beachy waves with a center part for effortless glam",
        "Dewy skin with a nude lip — the 'no makeup' makeup look",
        "Bold red lip with minimal eye makeup for classic elegance",
        "High ponytail with face-framing pieces for a chic sporty look",
        "Smokey eye in brown tones with glossy lips for evening events",
        "Curtain bangs with soft waves for a trendy, youthful vibe",
        "Clean skin with bold brows and clear lip gloss — minimum effort, maximum impact",
        "Side-swept hair with a deep part for dramatic sophistication",
        "Messy French braid or fishtail for a boho-romantic feel",
        "Winged eyeliner with a nude lip for sharp, editorial vibes",
        "Natural curls or coils defined with gel for texture appreciation",
        "Space buns or double braids for a playful, Gen-Z aesthetic",
        "Soft pink blush with a matching lip tint for a fresh monochrome look",
        "Half-up half-down hairstyle with a claw clip for trendy casual",
        "Bronzed skin with a warm highlight and nude gloss for a sun-kissed glow",
        "Straight and sleek hair with a middle part for minimalist chic",
        "Fox-eye makeup look with lifted brows for a bold statement",
        "Braided crown or halo braid for special occasions or boho outfits",
        "Graphic eyeliner in a color that complements the outfit for creative flair"
    ];

    // ══════════════════════════════════════════════
    //   COLOR ANALYSIS ENGINE
    // ══════════════════════════════════════════════

    function analyzeImageColors(img) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const size = 100; // downscale for speed
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        let totalR = 0, totalG = 0, totalB = 0;
        let totalSat = 0, totalLight = 0;
        const colorBuckets = {};
        const pixels = size * size;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            totalR += r; totalG += g; totalB += b;

            // Convert to HSL
            const rn = r / 255, gn = g / 255, bn = b / 255;
            const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
            const l = (max + min) / 2;
            let s = 0;
            if (max !== min) {
                s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
            }
            totalSat += s;
            totalLight += l;

            // Bucket colors
            const bucket = `${Math.round(r / 32)}-${Math.round(g / 32)}-${Math.round(b / 32)}`;
            colorBuckets[bucket] = (colorBuckets[bucket] || 0) + 1;
        }

        const avgR = totalR / pixels, avgG = totalG / pixels, avgB = totalB / pixels;
        const avgSat = totalSat / pixels;
        const avgLight = totalLight / pixels;
        const uniqueColors = Object.keys(colorBuckets).length;

        // Determine dominant color family
        let dominantFamily = "neutral";
        if (avgR > avgG + 30 && avgR > avgB + 30) dominantFamily = "warm";
        else if (avgB > avgR + 30 && avgB > avgG + 20) dominantFamily = "cool";
        else if (avgG > avgR + 20 && avgG > avgB + 20) dominantFamily = "earthy";

        // Is it dark/light outfit?
        const isDark = avgLight < 0.35;
        const isLight = avgLight > 0.65;
        const isColorful = avgSat > 0.3;
        const isMonochrome = uniqueColors < 20;

        return {
            avgR, avgG, avgB, avgSat, avgLight,
            uniqueColors, dominantFamily,
            isDark, isLight, isColorful, isMonochrome
        };
    }

    function generateAnalysis(colorProfile) {
        // ── Score generation influenced by color analysis ──
        const baseStyle = 65 + Math.random() * 25; // 65-90
        const baseVibe = 60 + Math.random() * 30;  // 60-90

        // Bonuses
        let styleBonus = 0, vibeBonus = 0;
        if (colorProfile.isMonochrome) styleBonus += 5; // monochrome = intentional
        if (colorProfile.isColorful) vibeBonus += 5;    // colorful = vibrant
        if (colorProfile.isDark) { styleBonus += 3; vibeBonus += 2; } // dark = sleek
        if (colorProfile.dominantFamily === "warm") vibeBonus += 3;
        if (colorProfile.dominantFamily === "cool") styleBonus += 3;

        const styleScore = Math.min(98, Math.round(baseStyle + styleBonus));
        const vibeScore = Math.min(98, Math.round(baseVibe + vibeBonus));

        // ── Pick labels based on color profile ──
        let styleLabelPool, vibeLabelPool;
        if (colorProfile.isDark) {
            styleLabelPool = ["Urban Sleek", "Elegant Minimalist", "Power Dressing", "Avant-Garde", "Classic Sophisticate"];
            vibeLabelPool = ["Mysterious Allure", "Bold & Confident", "Fierce & Fearless", "Edgy & Raw", "Downtown Chic"];
        } else if (colorProfile.isLight) {
            styleLabelPool = ["Modern Romantic", "Chic & Polished", "Boho Dreamer", "Preppy Perfection", "Effortlessly Stylish"];
            vibeLabelPool = ["Soft & Dreamy", "Fresh & Vibrant", "Sunny & Warm", "Ethereal Glow", "Clean & Crisp"];
        } else if (colorProfile.isColorful) {
            styleLabelPool = ["Bold & Trendy", "Streetwear Icon", "Avant-Garde", "Retro Vibes", "Casual Cool"];
            vibeLabelPool = ["Main Character Energy", "Fresh & Vibrant", "Bold & Confident", "Golden Hour Aesthetic", "Fierce & Fearless"];
        } else {
            styleLabelPool = STYLE_LABELS;
            vibeLabelPool = VIBE_LABELS;
        }

        return {
            style_score: styleScore,
            style_label: pick(styleLabelPool),
            vibe_score: vibeScore,
            vibe_label: pick(vibeLabelPool),
            improvements: pickMultiple(IMPROVEMENTS, 4),
            photo_poses: pickMultiple(PHOTO_POSES, 4),
            pairing: pickMultiple(PAIRING_ITEMS, 4),
            hair_and_makeup: pickMultiple(HAIR_MAKEUP, 4)
        };
    }

    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function pickMultiple(arr, count) {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // ══════════════════════════════════════════════
    //   FILE HANDLING
    // ══════════════════════════════════════════════

    function handleFiles(files) {
        if (!files || !files.length) return;
        const file = files[0];
        if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
            showToast("Please upload a JPG, PNG, or WEBP image.", "error");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showToast("Image must be under 10 MB.", "error");
            return;
        }
        currentFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            imageData = e.target.result;
            dropZoneContent.classList.add("hidden");
            previewArea.classList.remove("hidden");
            analyzeBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    function removeImage() {
        currentFile = null;
        imageData = null;
        previewImage.src = "";
        previewArea.classList.add("hidden");
        dropZoneContent.classList.remove("hidden");
        analyzeBtn.disabled = true;
        fileInput.value = "";
    }

    // ══════════════════════════════════════════════
    //   ANALYSIS FLOW
    // ══════════════════════════════════════════════

    async function analyze() {
        if (!imageData) {
            showToast("Please upload an outfit photo first.", "error");
            return;
        }

        // UI: loading state
        const btnText = $(".btn-text");
        const btnLoader = $(".btn-loader");
        btnText.classList.add("hidden");
        btnLoader.classList.remove("hidden");
        analyzeBtn.disabled = true;

        try {
            // Load image for color analysis
            const img = new Image();
            img.crossOrigin = "anonymous";
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageData;
            });

            // Simulate AI processing delay (feels more realistic)
            await new Promise(r => setTimeout(r, 1800 + Math.random() * 1200));

            // Analyze colors and generate results
            const colorProfile = analyzeImageColors(img);
            const result = generateAnalysis(colorProfile);
            renderResults(result);
        } catch (err) {
            console.error("Analysis failed:", err);
            showToast("Something went wrong. Please try again.", "error");
        } finally {
            btnText.classList.remove("hidden");
            btnLoader.classList.add("hidden");
            analyzeBtn.disabled = false;
        }
    }

    // ══════════════════════════════════════════════
    //   RENDER RESULTS
    // ══════════════════════════════════════════════

    function renderResults(data) {
        animateScore(styleCircle, styleScoreValue, data.style_score || 0);
        animateScore(vibeCircle, vibeScoreValue, data.vibe_score || 0);
        styleLabel.textContent = data.style_label || "-";
        vibeLabel.textContent = data.vibe_label || "-";

        fillList(improvementsList, data.improvements);
        fillList(posesList, data.photo_poses);
        fillList(pairingList, data.pairing);
        fillList(hairMakeupList, data.hair_and_makeup);

        resultsSection.classList.remove("hidden");
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function fillList(ul, items) {
        ul.innerHTML = "";
        if (!items || !items.length) {
            ul.innerHTML = "<li>No suggestions available.</li>";
            return;
        }
        items.forEach((item, i) => {
            const li = document.createElement("li");
            li.textContent = item;
            li.style.animationDelay = `${i * 0.1}s`;
            li.style.animation = "fadeInItem 0.4s ease-out forwards";
            li.style.opacity = "0";
            ul.appendChild(li);
        });
    }

    // Inject keyframe animation
    if (!document.querySelector("#fitcheck-keyframes")) {
        const style = document.createElement("style");
        style.id = "fitcheck-keyframes";
        style.textContent = `@keyframes fadeInItem { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }`;
        document.head.appendChild(style);
    }

    function animateScore(circle, valueEl, score) {
        const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
        circle.style.strokeDasharray = CIRCUMFERENCE;
        circle.style.strokeDashoffset = CIRCUMFERENCE;
        void circle.getBoundingClientRect();
        requestAnimationFrame(() => {
            circle.style.transition = "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)";
            circle.style.strokeDashoffset = offset;
        });
        animateNumber(valueEl, 0, score, 1400);
    }

    function animateNumber(el, from, to, duration) {
        const start = performance.now();
        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(from + (to - from) * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // ══════════════════════════════════════════════
    //   TOAST NOTIFICATION
    // ══════════════════════════════════════════════

    function showToast(message, type = "info") {
        let toast = document.querySelector(".toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.className = "toast";
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.className = `toast ${type}`;
        requestAnimationFrame(() => toast.classList.add("show"));
        setTimeout(() => toast.classList.remove("show"), 3500);
    }

    // ══════════════════════════════════════════════
    //   EVENT BINDING
    // ══════════════════════════════════════════════

    function init() {
        // Drop zone
        dropZone.addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("drag-over");
        });
        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("drag-over");
        });
        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("drag-over");
            handleFiles(e.dataTransfer.files);
        });

        // Remove image
        removeImageBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            removeImage();
        });

        // Analyze
        analyzeBtn.addEventListener("click", analyze);

        // Try again
        tryAgainBtn.addEventListener("click", () => {
            resultsSection.classList.add("hidden");
            removeImage();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    init();
})();
