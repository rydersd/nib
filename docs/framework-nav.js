/* ========================================================================
   Framework Navigation Data (framework-nav.js) -- docs version

   Same structure as examples/framework-nav.js but with paths relative
   to the docs/ directory.
   ======================================================================== */

(function() {
  'use strict';

  var examplesPrefix = '../examples/';

  window.WF_FRAMEWORK_NAV = {
    examples: [
      { label: 'All Examples',      path: examplesPrefix + 'index.html' },
      { label: 'Sales Portal',      path: examplesPrefix + 'test-project/dashboard.html' },
      { label: 'Data Table',        path: examplesPrefix + 'data-table/index.html' },
      { label: 'Agent Chat',        path: examplesPrefix + 'agent-chat/index.html' },
      { label: 'Newspaper',         path: examplesPrefix + 'newspaper/index.html' },
      { label: 'Pinterest Board',   path: examplesPrefix + 'pinterest-board/index.html' },
      { label: 'Kanban Board',      path: examplesPrefix + 'kanban-board/index.html' },
      { label: 'Charts Dashboard',  path: examplesPrefix + 'charts-dashboard/index.html' }
    ],
    docs: [
      { label: 'Wiki Home',          path: 'Home.md' },
      { label: 'Getting Started',    path: 'Getting-Started.md' },
      { label: 'New Project',        path: 'New-Project.md' },
      { label: 'Philosophy',         path: 'Philosophy.md' },
      { label: 'Glossary',           path: 'Glossary.md' },
      { label: 'Design Tokens',      path: 'Design-Tokens.md' },
      { label: 'Components (live)',  path: 'components.html' },
      { label: 'Paper Utilities',    path: 'Paper-Utilities.md' },
      { label: 'Icons',              path: 'Icons.md' },
      { label: 'Themes',             path: 'Themes.md' },
      { label: 'Fidelity Levels',    path: 'Fidelity-Levels.md' },
      { label: 'Confidence Levels',  path: 'Confidence-Levels.md' },
      { label: 'Page Template',      path: 'Page-Template.md' },
      { label: 'Page Blueprint',     path: 'Page-Blueprint.md' },
      { label: 'Page Compose',       path: 'Page-Compose.md' },
      { label: 'Layouts',            path: 'Layouts.md' },
      { label: 'Design Notes',       path: 'Design-Notes.md' },
      { label: 'Architecture',       path: 'Architecture.md' },
      { label: 'Navigation',         path: 'Navigation.md' },
      { label: 'Review Mode',        path: 'Review-Mode.md' },
      { label: 'Feedback',           path: 'Feedback.md' },
      { label: 'Doctor',             path: 'Doctor.md' },
      { label: 'Surfaces',           path: 'Surfaces.md' },
      { label: 'Surface: Internal',  path: 'Surface-Internal.md' },
      { label: 'Surface: Slack',     path: 'Surface-Slack.md' },
      { label: 'Surface: Salesforce', path: 'Surface-Salesforce.md' },
      { label: 'SLDS Rules',         path: 'SLDS-Rules.md' },
      { label: 'Project Deliverables', path: 'Project-Deliverables.md' },
      { label: 'Examples',           path: 'Examples.md' },
      { label: 'Compliance',         path: 'Compliance.md' },
      { label: 'Review Agents',      path: 'Review-Agents.md' },
      { label: 'Lessons Learned',    path: 'Lessons-Learned.md' },
      { label: 'For Agents',         path: 'For-Agents.md' }
    ]
  };
})();
