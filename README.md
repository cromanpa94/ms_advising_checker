# Firefox extension to check for graduation requirements in GradPath (University of Arizona)

This repo hosts a simple Firefox extension that checks on whether the requierements for a given program (or subplan) are being met by the student. This version focuses on Data Science and Information Science programs in InfoSci. However, this extension can be easily modified to enable other programs or subplans. It can also be adjusted in the requirements it check for. I did not implement an automatic submission.

To install this extension, please use the following steps:
1. Go to about:debugging in Firefox
2. Click "This Firefox" → "Load Temporary Add-on"
3. Select `manifest.json` (you should have all the files in this repo on the same folder)
4. Navigate to the student's GradPath / UAccess Plan of Study page
5. Automatic detection happens but you can also navigate to the extension icon and use "Check Plan of Study"
