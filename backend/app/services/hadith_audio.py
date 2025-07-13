import os
import httpx
import base64
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class HadithAudioService:
    """Service for generating hadith audio using various TTS services."""
    
    def __init__(self):
        # You can use different TTS services here
        # Options: Google Cloud TTS, AWS Polly, Azure Speech, etc.
        self.service = "browser"  # Using browser TTS for now
        
    async def generate_audio_url(self, arabic_text: str, hadith_id: str) -> Optional[str]:
        """
        Generate audio URL for hadith text.
        Returns a URL to the audio file or None if generation fails.
        """
        try:
            # Option 1: Use an existing Islamic audio API if available
            # Example: Check if audio exists on islamhouse.com or similar
            
            # Option 2: Use Google Cloud Text-to-Speech (requires API key)
            # audio_content = await self._google_tts(arabic_text)
            
            # Option 3: Use Azure Cognitive Services Speech
            # audio_content = await self._azure_tts(arabic_text)
            
            # For now, return None to use browser TTS
            return None
            
        except Exception as e:
            logger.error(f"Failed to generate audio for hadith {hadith_id}: {str(e)}")
            return None
            
    async def _google_tts(self, text: str) -> bytes:
        """Generate audio using Google Cloud Text-to-Speech."""
        # Requires setting up Google Cloud credentials
        api_key = os.getenv("GOOGLE_CLOUD_API_KEY")
        
        if not api_key:
            raise ValueError("Google Cloud API key not configured")
            
        url = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={api_key}"
        
        payload = {
            "input": {"text": text},
            "voice": {
                "languageCode": "ar-XA",  # Arabic
                "name": "ar-XA-Wavenet-D",  # Male voice
                "ssmlGender": "MALE"
            },
            "audioConfig": {
                "audioEncoding": "MP3",
                "speakingRate": 0.85,  # Slightly slower for clarity
                "pitch": -2.0  # Lower pitch
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            
            audio_content = response.json()["audioContent"]
            return base64.b64decode(audio_content)
            
    async def _azure_tts(self, text: str) -> bytes:
        """Generate audio using Azure Cognitive Services Speech."""
        subscription_key = os.getenv("AZURE_SPEECH_KEY")
        region = os.getenv("AZURE_SPEECH_REGION", "westus")
        
        if not subscription_key:
            raise ValueError("Azure Speech key not configured")
            
        url = f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1"
        
        headers = {
            "Ocp-Apim-Subscription-Key": subscription_key,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3"
        }
        
        ssml = f"""
        <speak version='1.0' xml:lang='ar-SA'>
            <voice xml:lang='ar-SA' xml:gender='Male' name='ar-SA-HamedNeural'>
                <prosody rate='-15%' pitch='-10%'>
                    {text}
                </prosody>
            </voice>
        </speak>
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, content=ssml)
            response.raise_for_status()
            
            return response.content
            
    async def get_reciter_audio(self, hadith_reference: str) -> Optional[str]:
        """
        Try to find existing audio from known reciters.
        This could check various Islamic audio databases.
        """
        # Example: Check if audio exists on known Islamic websites
        # This would require partnerships or agreements with these sites
        
        return None