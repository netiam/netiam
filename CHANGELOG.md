2015-01-10

NEW:

  - added local, basic and bearer authentication fix: lint issues
  - authentication and login
  - authenticate plugin fix: ACL plugin now handles document(s) on input and output
  - pre/post hooks for plugins refactoring: moved filter module as function into ACL plugin chore: added utils/filter for tests
  - chore: idParam is now an option of resource  added correct error handling
  - added asserts (owner)
  - feature: added changelog generation, the changelog is generated based on this commit conventions https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit.  added release task excluded changelog from README fix: pushTo option was wrong
  - added automatic version bump and changelog generation
  - added data plugin refactoring: renamed custom to transform
  - allow registration of custom modules fix: updated section about plugins
  - feature: plugin system  basic pipelining

FIXES:

  - docs:  plugin section and added some badges
  - wrong path to role model
  - feature: added local, basic and bearer authentication  lint issues
  - lint issues
  - feature: authenticate plugin  ACL plugin now handles document(s) on input and output
  - mixed values now using the correct JSDoc notation
  - chore: explicit definition for error properties  lint issue with rest plugin
  - normalized error message
  - fix:  lint issues in acl and data plugin
  - docs:  link to plugins.md
  - lint issues
  - styling of headings, name of ToC has been changed to specification
  - removed jshint messages
  - travis before script was using the wrong task
  - fix:  data plugin in README
  - feature: added changelog generation, the changelog is generated based on this commit conventions https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit. feature: added release task excluded changelog from README  pushTo option was wrong
  - updated &quot;Getting started&quot; example
  - renamed property to avoid naming conflict with method
  - using body getter/setter instead of data property
  - added section about how to use
  - feature: allow registration of custom modules  updated section about plugins
  - npm test script
  - removed .DS_Store
  - today section in README
  - typos in README
