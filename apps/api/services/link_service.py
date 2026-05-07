import httpx
from bs4 import BeautifulSoup
from sqlmodel.ext.asyncio.session import AsyncSession

from models.link import Link


async def scrape_url(workspace_id: int, url: str, db: AsyncSession) -> Link:
    title, text = await _scrape(url)

    link = Link(
        workspace_id=workspace_id,
        url=url,
        title=title,
        scraped_text=text,
    )
    db.add(link)
    await db.commit()
    await db.refresh(link)
    return link


async def _scrape(url: str) -> tuple[str, str]:
    async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
        response = await client.get(url, headers={"User-Agent": "NexusNote/1.0"})
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    title = soup.title.string.strip() if soup.title and soup.title.string else url

    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    text = " ".join(soup.get_text(separator=" ").split())
    return title, text
