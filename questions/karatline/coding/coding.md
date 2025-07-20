<!--
You are building a travel booking website. Your task is to style a featured destination card.

The requirements:
- A visible border around the entire card.
- Destination image fills exactly 70% of the card width, horizontally centered.
- Destination name is bold and centered directly below the image.
- Short description is centered below the destination name in regular font style.
- Card is fully responsive, scaling neatly from desktop to mobile screens (320px and above).

Sample Data:
- Destination: Kyoto, Japan
- Image URL: https://public.karat.io/content/kyoto.jpg
- Description: Experience temples, gardens, and traditional culture.
-->
<!-- Card -->
<div id="destination-card" style="
    border: 2px solid #ddd;
    border-radius: 12px;
    background: white;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    overflow: hidden;
    width: 100%;
    max-width: 400px;
    min-width: 280px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    margin: 0 auto;
    box-sizing: border-box;
">
    <!-- Image Container: No padding here, image is 70% of full card width -->
    <div style="padding: 20px 0 0 0; text-align: center;">
        <img src="https://public.karat.io/content/kyoto.jpg" 
            style="
                width: 70%;
                height: auto;
                display: block;
                margin: 0 auto;
                border-radius: 8px;
                object-fit: cover;
                min-height: 150px;
                max-height: 200px;
            "
            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" 
            alt="Kyoto, Japan" />
        
        <!-- Fallback for broken images -->
        <div style="
            display: none;
            width: 70%;
            height: 150px;
            background: #ddd;
            color: #666;
            margin: 0 auto;
            text-align: center;
            line-height: 150px;
            font-size: 14px;
            border-radius: 8px;
        ">
            Image Not Available
        </div>
    </div>
    
    <!-- Content Container: Only this has horizontal padding -->
    <div style="padding: 15px 20px 20px 20px;">
        <!-- Destination name: bold, centered -->
        <h2 style="
            font-weight: bold;
            font-size: clamp(18px, 5vw, 24px);
            margin: 0 0 10px 0;
            color: #333;
            text-align: center;
            word-wrap: break-word;
            line-height: 1.3;
        ">Kyoto, Japan</h2>
        
        <!-- Description: centered, regular font -->
        <p style="
            font-size: clamp(14px, 4vw, 16px);
            color: #666;
            margin: 0;
            text-align: center;
            word-wrap: break-word;
            line-height: 1.5;
        ">Experience temples, gardens, and traditional culture.</p>
    </div>
</div>

  <style>
    
    @media (min-width: 1201px) {
    #destination-card {
        max-width: 400px !important;
        width: 400px !important;
    }
}

@media (max-width: 1200px) and (min-width: 769px) {
    #destination-card {
        max-width: min(400px, 70vw) !important;
        width: min(70vw !important;
    }
}

@media (max-width: 768px) and (min-width: 481px) {
    #destination-card {
        max-width: 80vw !important;
        width: 80vw !important;
    }
}

@media (max-width: 480px) and (min-width: 321px) {
    #destination-card {
        max-width: 90vw !important;
        width: 90vw !important;
        min-width: 280px !important;
    }
}

@media (max-width: 320px) {
    #destination-card {
        width: calc(100vw - 16px) !important;
        max-width: calc(100vw - 16px) !important;
        min-width: calc(100vw - 16px) !important;
    }
}

    
  </style>
  
</div>