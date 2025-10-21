(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-INVALID-JOB-TITLE u101)
(define-constant ERR-INVALID-DESCRIPTION u102)
(define-constant ERR-INVALID-BUDGET u103)
(define-constant ERR-INVALID-DEADLINE u104)
(define-constant ERR-JOB-ALREADY-EXISTS u105)
(define-constant ERR-JOB-NOT-FOUND u106)
(define-constant ERR-INVALID-STATUS u107)
(define-constant ERR-INVALID-MILESTONES u108)
(define-constant ERR-INVALID-FREELANCER u109)
(define-constant ERR-INVALID-CLIENT u110)
(define-constant ERR-ESCROW-NOT-SET u111)
(define-constant ERR-BID-MANAGER-NOT-SET u112)
(define-constant ERR-MILESTONE-MANAGER-NOT-SET u113)
(define-constant ERR-DISPUTE-RESOLUTION-NOT-SET u114)
(define-constant ERR-REPUTATION-SYSTEM-NOT-SET u115)
(define-constant ERR-IPFS-VERIFIER-NOT-SET u116)
(define-constant ERR-INVALID-CATEGORY u117)
(define-constant ERR-INVALID-SKILLS u118)
(define-constant ERR-INVALID-PAYMENT-TERMS u119)
(define-constant ERR-INVALID-REVISION-LIMIT u120)
(define-constant ERR-INVALID-ESCROW-FEE u121)
(define-constant ERR-MAX-JOBS-EXCEEDED u122)
(define-data-var next-job-id uint u0)
(define-data-var max-jobs uint u10000)
(define-data-var platform-fee uint u500)
(define-data-var escrow-contract principal 'SP000000000000000000002Q6VF78.bogus-escrow)
(define-data-var bid-manager-contract principal 'SP000000000000000000002Q6VF78.bogus-bid-manager)
(define-data-var milestone-manager-contract principal 'SP000000000000000000002Q6VF78.bogus-milestone-manager)
(define-data-var dispute-resolution-contract principal 'SP000000000000000000002Q6VF78.bogus-dispute-resolution)
(define-data-var reputation-system-contract principal 'SP000000000000000000002Q6VF78.bogus-reputation-system)
(define-data-var ipfs-verifier-contract principal 'SP000000000000000000002Q6VF78.bogus-ipfs-verifier)
(define-map jobs
  uint
  {
    title: (string-utf8 100),
    description: (string-utf8 1000),
    budget: uint,
    deadline: uint,
    client: principal,
    freelancer: (optional principal),
    status: uint,
    milestones: uint,
    category: (string-utf8 50),
    skills: (list 10 (string-utf8 50)),
    payment-terms: (string-utf8 100),
    revision-limit: uint,
    escrow-fee: uint,
    timestamp: uint
  }
)
(define-map jobs-by-title
  (string-utf8 100)
  uint)
(define-map job-updates
  uint
  {
    update-title: (string-utf8 100),
    update-description: (string-utf8 1000),
    update-budget: uint,
    update-timestamp: uint,
    updater: principal
  }
)
(define-read-only (get-job (id uint))
  (map-get? jobs id)
)
(define-read-only (get-job-updates (id uint))
  (map-get? job-updates id)
)
(define-read-only (is-job-registered (title (string-utf8 100)))
  (is-some (map-get? jobs-by-title title))
)
(define-private (validate-title (title (string-utf8 100)))
  (if (and (> (len title) u0) (<= (len title) u100))
      (ok true)
      (err ERR-INVALID-JOB-TITLE))
)
(define-private (validate-description (desc (string-utf8 1000)))
  (if (and (> (len desc) u0) (<= (len desc) u1000))
      (ok true)
      (err ERR-INVALID-DESCRIPTION))
)
(define-private (validate-budget (budget uint))
  (if (> budget u0)
      (ok true)
      (err ERR-INVALID-BUDGET))
)
(define-private (validate-deadline (deadline uint))
  (if (> deadline block-height)
      (ok true)
      (err ERR-INVALID-DEADLINE))
)
(define-private (validate-status (status uint))
  (if (<= status u5)
      (ok true)
      (err ERR-INVALID-STATUS))
)
(define-private (validate-milestones (milestones uint))
  (if (and (> milestones u0) (<= milestones u10))
      (ok true)
      (err ERR-INVALID-MILESTONES))
)
(define-private (validate-freelancer (freelancer principal))
  (if (not (is-eq freelancer tx-sender))
      (ok true)
      (err ERR-INVALID-FREELANCER))
)
(define-private (validate-client (client principal))
  (if (is-eq client tx-sender)
      (ok true)
      (err ERR-INVALID-CLIENT))
)
(define-private (validate-category (cat (string-utf8 50)))
  (if (and (> (len cat) u0) (<= (len cat) u50))
      (ok true)
      (err ERR-INVALID-CATEGORY))
)
(define-private (validate-skills (skills (list 10 (string-utf8 50))))
  (if (<= (len skills) u10)
      (ok true)
      (err ERR-INVALID-SKILLS))
)
(define-private (validate-payment-terms (terms (string-utf8 100)))
  (if (<= (len terms) u100)
      (ok true)
      (err ERR-INVALID-PAYMENT-TERMS))
)
(define-private (validate-revision-limit (limit uint))
  (if (<= limit u5)
      (ok true)
      (err ERR-INVALID-REVISION-LIMIT))
)
(define-private (validate-escrow-fee (fee uint))
  (if (<= fee u1000)
      (ok true)
      (err ERR-INVALID-ESCROW-FEE))
)
(define-public (set-escrow-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender contract-caller) (err ERR-NOT-AUTHORIZED))
    (ok (var-set escrow-contract contract))
  )
)
(define-public (set-bid-manager-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender contract-caller) (err ERR-NOT-AUTHORIZED))
    (ok (var-set bid-manager-contract contract))
  )
)
(define-public (set-milestone-manager-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender contract-caller) (err ERR-NOT-AUTHORIZED))
    (ok (var-set milestone-manager-contract contract))
  )
)
(define-public (set-dispute-resolution-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender contract-caller) (err ERR-NOT-AUTHORIZED))
    (ok (var-set dispute-resolution-contract contract))
  )
)
(define-public (set-reputation-system-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender contract-caller) (err ERR-NOT-AUTHORIZED))
    (ok (var-set reputation-system-contract contract))
  )
)
(define-public (set-ipfs-verifier-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender contract-caller) (err ERR-NOT-AUTHORIZED))
    (ok (var-set ipfs-verifier-contract contract))
  )
)
(define-public (create-job
  (title (string-utf8 100))
  (description (string-utf8 1000))
  (budget uint)
  (deadline uint)
  (milestones uint)
  (category (string-utf8 50))
  (skills (list 10 (string-utf8 50)))
  (payment-terms (string-utf8 100))
  (revision-limit uint)
  (escrow-fee uint)
)
  (let (
    (next-id (+ (var-get next-job-id) u1))
  )
    (asserts! (< (var-get next-job-id) (var-get max-jobs)) (err ERR-MAX-JOBS-EXCEEDED))
    (try! (validate-title title))
    (try! (validate-description description))
    (try! (validate-budget budget))
    (try! (validate-deadline deadline))
    (try! (validate-milestones milestones))
    (try! (validate-category category))
    (try! (validate-skills skills))
    (try! (validate-payment-terms payment-terms))
    (try! (validate-revision-limit revision-limit))
    (try! (validate-escrow-fee escrow-fee))
    (asserts! (is-none (map-get? jobs-by-title title)) (err ERR-JOB-ALREADY-EXISTS))
    (map-set jobs next-id
      {
        title: title,
        description: description,
        budget: budget,
        deadline: deadline,
        client: tx-sender,
        freelancer: none,
        status: u0,
        milestones: milestones,
        category: category,
        skills: skills,
        payment-terms: payment-terms,
        revision-limit: revision-limit,
        escrow-fee: escrow-fee,
        timestamp: block-height
      }
    )
    (map-set jobs-by-title title next-id)
    (var-set next-job-id next-id)
    (print { event: "job-created", id: next-id })
    (ok next-id)
  )
)
(define-public (hire-freelancer (job-id uint) (freelancer principal))
  (let ((job (unwrap! (map-get? jobs job-id) (err ERR-JOB-NOT-FOUND))))
    (try! (validate-freelancer freelancer))
    (asserts! (is-eq (get client job) tx-sender) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-eq (get status job) u0) (err ERR-INVALID-STATUS))
    (map-set jobs job-id (merge job { freelancer: (some freelancer), status: u1 }))
    (print { event: "freelancer-hired", job-id: job-id, freelancer: freelancer })
    (ok true)
  )
)
(define-public (complete-job (job-id uint))
  (let ((job (unwrap! (map-get? jobs job-id) (err ERR-JOB-NOT-FOUND))))
    (asserts! (or (is-eq (get client job) tx-sender) (is-eq (unwrap! (get freelancer job) (err ERR-INVALID-FREELANCER)) tx-sender)) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-eq (get status job) u1) (err ERR-INVALID-STATUS))
    (map-set jobs job-id (merge job { status: u2 }))
    (print { event: "job-completed", job-id: job-id })
    (ok true)
  )
)
(define-public (update-job
  (job-id uint)
  (update-title (string-utf8 100))
  (update-description (string-utf8 1000))
  (update-budget uint)
)
  (let ((job (unwrap! (map-get? jobs job-id) (err ERR-JOB-NOT-FOUND))))
    (asserts! (is-eq (get client job) tx-sender) (err ERR-NOT-AUTHORIZED))
    (try! (validate-title update-title))
    (try! (validate-description update-description))
    (try! (validate-budget update-budget))
    (let ((existing (map-get? jobs-by-title update-title)))
      (match existing
        existing-id (asserts! (is-eq existing-id job-id) (err ERR-JOB-ALREADY-EXISTS))
        true
      )
    )
    (let ((old-title (get title job)))
      (if (is-eq old-title update-title)
          true
          (begin
            (map-delete jobs-by-title old-title)
            (map-set jobs-by-title update-title job-id)
          )
      )
    )
    (map-set jobs job-id
      (merge job
        {
          title: update-title,
          description: update-description,
          budget: update-budget,
          timestamp: block-height
        }
      )
    )
    (map-set job-updates job-id
      {
        update-title: update-title,
        update-description: update-description,
        update-budget: update-budget,
        update-timestamp: block-height,
        updater: tx-sender
      }
    )
    (print { event: "job-updated", id: job-id })
    (ok true)
  )
)
(define-public (get-job-count)
  (ok (var-get next-job-id))
)
(define-public (check-job-existence (title (string-utf8 100)))
  (ok (is-job-registered title))
)