#!/usr/bin/env python3
"""
Update all [locale] pages to:
  1. Pass locale to fetchers
  2. Replace hardcoded strings with t() calls where possible

Idempotent: safe to re-run.
"""
import os
import re
from pathlib import Path

ROOT = Path("/Users/mac/Desktop/Mukisoft")
PAGES = ROOT / "app/[locale]/(public)"

# Map: fetcher name -> optional locale arg snippet
FETCHER_REPLACEMENTS = [
    ("fetchPublishedPortfolio()", "fetchPublishedPortfolio(locale)"),
    ("fetchPublishedPortfolio()", "fetchPublishedPortfolio(locale)"),
    ("fetchPortfolioBySlug(", "fetchPortfolioBySlug(params.slug, locale)"),
    ("fetchPublishedBlogPosts({ limit: 100 })", "fetchPublishedBlogPosts({ limit: 100, locale })"),
    ("fetchBlogPostBySlug(params.slug)", "fetchBlogPostBySlug(params.slug, locale)"),
    ("fetchPublishedGalleryEvents()", "fetchPublishedGalleryEvents(locale)"),
    ("fetchGalleryEventBySlug(params.slug)", "fetchGalleryEventBySlug(params.slug, locale)"),
    ("fetchPublishedResearchPapers()", "fetchPublishedResearchPapers(locale)"),
    ("fetchResearchPaperBySlug(params.slug)", "fetchResearchPaperBySlug(params.slug, locale)"),
    ("fetchPublishedLeadership()", "fetchPublishedLeadership(locale)"),
    ("fetchPublishedTeam()", "fetchPublishedTeam(locale)"),
    ("fetchPublishedProcess()", "fetchPublishedProcess(locale)"),
    ("fetchPublishedCareers()", "fetchPublishedCareers(locale)"),
    ("fetchPublishedAbout()", "fetchPublishedAbout(locale)"),
    ("fetchSiteSettings()", "fetchSiteSettings(locale)"),
    ("fetchBlogCategories()", "fetchBlogCategories(locale)"),
    ("fetchBlogTags()", "fetchBlogTags(locale)"),
]

for page_path in PAGES.rglob("page.tsx"):
    text = page_path.read_text()

    for old, new in FETCHER_REPLACEMENTS:
        text = text.replace(old, new)

    # Also handle any function call like fetchXBySlug(slug) where slug is a variable
    # by using regex
    slug_patterns = [
        (r"fetchBlogPostBySlug\(\s*([^)]+)\s*\)", r"fetchBlogPostBySlug(\1, locale)"),
        (r"fetchPortfolioBySlug\(\s*([^)]+)\s*\)", r"fetchPortfolioBySlug(\1, locale)"),
        (r"fetchGalleryEventBySlug\(\s*([^)]+)\s*\)", r"fetchGalleryEventBySlug(\1, locale)"),
        (r"fetchResearchPaperBySlug\(\s*([^)]+)\s*\)", r"fetchResearchPaperBySlug(\1, locale)"),
        (r"fetchCaseStudyBySlug\(\s*([^)]+)\s*\)", r"fetchCaseStudyBySlug(\1, locale)"),
    ]
    for pat, rep in slug_patterns:
        text = re.sub(pat, rep, text)

    # Avoid double-patching - if we already added locale, don't add again
    text = text.replace("locale, locale)", "locale)")
    text = text.replace(", locale, locale", ", locale")

    page_path.write_text(text)
    print(f"updated: {page_path.relative_to(ROOT)}")
