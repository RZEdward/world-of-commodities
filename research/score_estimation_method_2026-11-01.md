# Employer review score estimation — 2026-11-01

## Reddit should be read in context

Reddit scores are assessments of the evidence found, not a literal average of comments. Interpret criticism relative to the standards and expertise of the people making it, the company's category and size, the role and seniority discussed, and how directly the comment reflects workplace experience. For example, a high-performing prop-trading employee may hold a very different bar for compensation, pace, or technical quality than a utility employee discussing general job satisfaction. A general industry thread, political discussion, or parent-company anecdote is not equivalent to a direct review of the target company's relevant team.

Keep direct employee accounts, employer reviews, indirect mentions, and unverified claims distinct in notes and evidence basis. Do not feed indirect, estimated, or unverified Reddit scores into the cross-platform calibration sample. The company-wide review score also does not establish a specific desk's profitability or outlook; that needs separate role/desk evidence.

## Live missing-Reddit estimate

Where Glassdoor is observed and Reddit workplace evidence is missing, the current estimate is:

`Estimated Reddit /10 = observed Glassdoor /10 × live median (observed Reddit /10 ÷ observed Glassdoor /10)`

The median is recalculated from Company Registry rows marked Observed on both platforms. It excludes estimated and indirect evidence. At this revision the eligible sample is intentionally narrow (Equinor and Jane Street); the workbook formula and dashboard export recompute the median as scores/basis labels change. The current small sample makes this a rough cross-platform bridge, not a universal relationship. Company/category-specific norms and critic standards need to be incorporated into the scoring rubric after owner calibration.

Company reputation currently blends Glassdoor and Reddit using the weights stored on the Score Model sheet (currently 75% / 25%). The weights are editable model inputs, not embedded in the missing-score scale factor. Rows without usable Glassdoor evidence, or without a calculable live ratio, do not receive a fabricated Reddit estimate.

## Evidence-quality exclusions

- BC Hydro: the Reddit reply was in a policy discussion and said the employee had not personally seen corners cut; excluded from paired-score calibration.
- Goldman Sachs: the Reddit account concerned UK consumer-banking operations, while the paired Glassdoor number is company-wide; excluded as a non-comparable pair.
- Alberta Electric System Operator: a public-sector policy discussion and self-identified former employee comment, not a comparable workplace review; excluded.
- Tesla Energy: the Reddit thread concerned parent-company Tesla and mixed/older experiences, while the registry score is tied to an Energy Systems Designer review; excluded.

These comments remain available as indirect evidence where appropriate; the exclusion only prevents them calibrating the live Reddit-to-Glassdoor ratio.

## Next calibration

Owner input is needed on peer-group normalization, source credibility, weighting/recentness, small-sample handling, and what to do when neither platform has attributable evidence. See the scoring questions in the project conversation before changing those rules.
