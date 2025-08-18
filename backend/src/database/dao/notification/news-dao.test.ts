/* eslint-disable @typescript-eslint/no-explicit-any */
import { NewsDAO } from '@src/database/dao/notification/news-dao.js';
import { DaoFixture } from '@src/utils/test-utils/dao-fixture.js';
import { describe, expect, it } from 'vitest';

DaoFixture.init({ recreateDatabasesBeforeEachTest: true });

describe('NewsDAO insert', () => {
  it('shall insert new news entity', async () => {
    const news = await NewsDAO.insert({
      fk_author_id: 1,
      title: 'title',
      content: 'content'
    });
    expect(news).toBeDefined();

    const data = await NewsDAO.findMultiple();

    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_author_id: 1,
        title: 'title',
        content: 'content',
        created_at: expect.any(Date),
        version: 1
      })
    ]);
  });

  it('shall fail to insert entity without fk_author_id', async () => {
    await expect(
      NewsDAO.insert({
        fk_author_id: undefined as any,
        title: 'title',
        content: 'content'
      })
    ).rejects.toThrow(/SQLITE_CONSTRAINT: NOT NULL constraint failed: news.fk_author_id/);
  });
});

describe('NewsDAO update', () => {
  it('shall update news entity', async () => {
    const news = await NewsDAO.insert({
      fk_author_id: 1,
      title: 'title',
      content: 'content'
    });

    const updatedNews = await NewsDAO.update({
      ...news,
      title: 'new title'
    });

    expect(updatedNews).toEqual({
      ...news,
      title: 'new title',
      version: 2
    });
  });
});

describe('NewsDAO delete', () => {
  it('shall delete news entity', async () => {
    const news = await NewsDAO.insert({
      fk_author_id: 1,
      title: 'title',
      content: 'content'
    });

    await NewsDAO.delete({ id: news.id });

    const data = await NewsDAO.findMultiple();
    expect(data).toEqual([]);
  });
});

describe('NewsDAO findMultiple', () => {
  it('shall return multiple news entities', async () => {
    await NewsDAO.insert({
      fk_author_id: 1,
      title: 'title',
      content: 'content'
    });

    const data = await NewsDAO.findMultiple();

    expect(data).toEqual([
      expect.objectContaining({
        id: 1,
        fk_author_id: 1,
        title: 'title',
        content: 'content',
        created_at: expect.any(Date),
        version: 1
      })
    ]);
  });
});
