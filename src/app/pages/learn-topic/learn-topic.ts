import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Article } from '../../components/article/article';
import { Button } from '../../components/button/button';
import { getLearnTopic, githubUrl } from '../../data/packages';

@Component({
  selector: 'app-learn-topic',
  imports: [Article, Button],
  templateUrl: './learn-topic.html',
  host: { class: 'page page--prose' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearnTopicPage {
  /** Bound from the `:slug` route param via `withComponentInputBinding()`. */
  readonly slug = input.required<string>();

  readonly topic = computed(() => getLearnTopic(this.slug()));

  readonly headingId = computed(() => `learn-topic-heading-${this.slug()}`);

  readonly githubHref = computed(() => {
    const github = this.topic()?.github;
    return github ? githubUrl(github) : undefined;
  });
}
