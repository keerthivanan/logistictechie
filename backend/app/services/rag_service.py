"""
LlamaIndex RAG over freight knowledge base.
Indexes markdown files and enables semantic search.
"""
import os
from pathlib import Path
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.openai import OpenAI as LlamaOpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from app.core.config import settings

_index: VectorStoreIndex | None = None


def _build_index() -> VectorStoreIndex:
    knowledge_dir = Path(__file__).parent.parent / "knowledge"
    Settings.llm = LlamaOpenAI(model="gpt-4o-mini", api_key=settings.OPENAI_API_KEY)
    Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small", api_key=settings.OPENAI_API_KEY)
    docs = SimpleDirectoryReader(str(knowledge_dir)).load_data()
    return VectorStoreIndex.from_documents(docs)


def get_index() -> VectorStoreIndex:
    global _index
    if _index is None:
        _index = _build_index()
    return _index


def query_knowledge(question: str) -> str:
    """Query the freight knowledge base and return an answer."""
    try:
        index = get_index()
        engine = index.as_query_engine(similarity_top_k=3)
        response = engine.query(question)
        return str(response)
    except Exception as e:
        return f"Knowledge base unavailable: {e}"
