import { Component } from '@angular/core';

import { Banner } from '../../components/banner/banner';

@Component({
  selector: 'app-blog',
  imports: [Banner],
  templateUrl: './blog.html',
  styleUrl: './blog.css',
})
export class Blog {}
