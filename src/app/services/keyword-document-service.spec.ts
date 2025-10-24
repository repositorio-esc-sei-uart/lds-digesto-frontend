import { TestBed } from '@angular/core/testing';

import { KeywordDocumentService } from './keyword-document-service';

describe('KeywordDocumentService', () => {
  let service: KeywordDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeywordDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
