from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="GT_", env_file=".env", extra="ignore")

    db_url: str = "sqlite:///data/demo/demo.db"
    model_dir: str = "models/current"
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:8080"
    ]
    log_level: str = "INFO"
    torch_threads: int = 4
    cache_size: int = 2048
    replay_default_speed: int = 900

settings = Settings()
