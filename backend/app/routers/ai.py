from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user
from app.models import User
from app.schemas import AIChatRequest, AIChatResponse
from app.services.ai_assistant import handle_ai_chat

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/chat", response_model=AIChatResponse)
def chat_with_profile_assistant(req: AIChatRequest, current_user: User = Depends(get_current_user)):
    try:
        response_text, is_complete, parsed_data = handle_ai_chat(
            section=req.section,
            messages=req.messages,
            current_form_data=req.current_form_data
        )
        
        return {
            "response_text": response_text,
            "is_complete": is_complete,
            "parsed_data": parsed_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing AI assistant chat: {str(e)}"
        )
