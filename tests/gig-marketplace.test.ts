import { describe, it, expect, beforeEach } from "vitest";
import { ClarityValue, stringUtf8CV, uintCV } from "@stacks/transactions";

const ERR_NOT_AUTHORIZED = 100;
const ERR_INVALID_JOB_TITLE = 101;
const ERR_INVALID_DESCRIPTION = 102;
const ERR_INVALID_BUDGET = 103;
const ERR_INVALID_DEADLINE = 104;
const ERR_JOB_ALREADY_EXISTS = 105;
const ERR_JOB_NOT_FOUND = 106;
const ERR_INVALID_STATUS = 107;
const ERR_INVALID_MILESTONES = 108;
const ERR_INVALID_FREELANCER = 109;
const ERR_INVALID_CATEGORY = 117;
const ERR_INVALID_SKILLS = 118;
const ERR_INVALID_PAYMENT_TERMS = 119;
const ERR_INVALID_REVISION_LIMIT = 120;
const ERR_INVALID_ESCROW_FEE = 121;
const ERR_MAX_JOBS_EXCEEDED = 122;

interface Job {
  title: string;
  description: string;
  budget: number;
  deadline: number;
  client: string;
  freelancer: string | null;
  status: number;
  milestones: number;
  category: string;
  skills: string[];
  paymentTerms: string;
  revisionLimit: number;
  escrowFee: number;
  timestamp: number;
}

interface JobUpdate {
  updateTitle: string;
  updateDescription: string;
  updateBudget: number;
  updateTimestamp: number;
  updater: string;
}

interface Result<T> {
  ok: boolean;
  value: T;
}

class GigMarketplaceMock {
  state: {
    nextJobId: number;
    maxJobs: number;
    platformFee: number;
    escrowContract: string;
    bidManagerContract: string;
    milestoneManagerContract: string;
    disputeResolutionContract: string;
    reputationSystemContract: string;
    ipfsVerifierContract: string;
    jobs: Map<number, Job>;
    jobUpdates: Map<number, JobUpdate>;
    jobsByTitle: Map<string, number>;
  } = {
    nextJobId: 0,
    maxJobs: 10000,
    platformFee: 500,
    escrowContract: "SP000000000000000000002Q6VF78.bogus-escrow",
    bidManagerContract: "SP000000000000000000002Q6VF78.bogus-bid-manager",
    milestoneManagerContract: "SP000000000000000000002Q6VF78.bogus-milestone-manager",
    disputeResolutionContract: "SP000000000000000000002Q6VF78.bogus-dispute-resolution",
    reputationSystemContract: "SP000000000000000000002Q6VF78.bogus-reputation-system",
    ipfsVerifierContract: "SP000000000000000000002Q6VF78.bogus-ipfs-verifier",
    jobs: new Map(),
    jobUpdates: new Map(),
    jobsByTitle: new Map(),
  };
  blockHeight: number = 0;
  caller: string = "ST1CLIENT";

  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      nextJobId: 0,
      maxJobs: 10000,
      platformFee: 500,
      escrowContract: "SP000000000000000000002Q6VF78.bogus-escrow",
      bidManagerContract: "SP000000000000000000002Q6VF78.bogus-bid-manager",
      milestoneManagerContract: "SP000000000000000000002Q6VF78.bogus-milestone-manager",
      disputeResolutionContract: "SP000000000000000000002Q6VF78.bogus-dispute-resolution",
      reputationSystemContract: "SP000000000000000000002Q6VF78.bogus-reputation-system",
      ipfsVerifierContract: "SP000000000000000000002Q6VF78.bogus-ipfs-verifier",
      jobs: new Map(),
      jobUpdates: new Map(),
      jobsByTitle: new Map(),
    };
    this.blockHeight = 0;
    this.caller = "ST1CLIENT";
  }

  createJob(
    title: string,
    description: string,
    budget: number,
    deadline: number,
    milestones: number,
    category: string,
    skills: string[],
    paymentTerms: string,
    revisionLimit: number,
    escrowFee: number
  ): Result<number> {
    if (this.state.nextJobId >= this.state.maxJobs) return { ok: false, value: ERR_MAX_JOBS_EXCEEDED };
    if (!title || title.length > 100) return { ok: false, value: ERR_INVALID_JOB_TITLE };
    if (!description || description.length > 1000) return { ok: false, value: ERR_INVALID_DESCRIPTION };
    if (budget <= 0) return { ok: false, value: ERR_INVALID_BUDGET };
    if (deadline <= this.blockHeight) return { ok: false, value: ERR_INVALID_DEADLINE };
    if (milestones <= 0 || milestones > 10) return { ok: false, value: ERR_INVALID_MILESTONES };
    if (!category || category.length > 50) return { ok: false, value: ERR_INVALID_CATEGORY };
    if (skills.length > 10) return { ok: false, value: ERR_INVALID_SKILLS };
    if (paymentTerms.length > 100) return { ok: false, value: ERR_INVALID_PAYMENT_TERMS };
    if (revisionLimit > 5) return { ok: false, value: ERR_INVALID_REVISION_LIMIT };
    if (escrowFee > 1000) return { ok: false, value: ERR_INVALID_ESCROW_FEE };
    if (this.state.jobsByTitle.has(title)) return { ok: false, value: ERR_JOB_ALREADY_EXISTS };
    const id = this.state.nextJobId + 1;
    const job: Job = {
      title,
      description,
      budget,
      deadline,
      client: this.caller,
      freelancer: null,
      status: 0,
      milestones,
      category,
      skills,
      paymentTerms: paymentTerms,
      revisionLimit,
      escrowFee,
      timestamp: this.blockHeight,
    };
    this.state.jobs.set(id, job);
    this.state.jobsByTitle.set(title, id);
    this.state.nextJobId = id;
    return { ok: true, value: id };
  }

  hireFreelancer(jobId: number, freelancer: string): Result<boolean> {
    const job = this.state.jobs.get(jobId);
    if (!job) return { ok: false, value: ERR_JOB_NOT_FOUND };
    if (job.client !== this.caller) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (job.status !== 0) return { ok: false, value: ERR_INVALID_STATUS };
    if (freelancer === this.caller) return { ok: false, value: ERR_INVALID_FREELANCER };
    this.state.jobs.set(jobId, { ...job, freelancer, status: 1 });
    return { ok: true, value: true };
  }

  completeJob(jobId: number): Result<boolean> {
    const job = this.state.jobs.get(jobId);
    if (!job) return { ok: false, value: ERR_JOB_NOT_FOUND };
    if (job.client !== this.caller && job.freelancer !== this.caller) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (job.status !== 1) return { ok: false, value: ERR_INVALID_STATUS };
    this.state.jobs.set(jobId, { ...job, status: 2 });
    return { ok: true, value: true };
  }

  getJob(id: number): Job | undefined {
    return this.state.jobs.get(id);
  }

  updateJob(jobId: number, updateTitle: string, updateDescription: string, updateBudget: number): Result<boolean> {
    const job = this.state.jobs.get(jobId);
    if (!job) return { ok: false, value: ERR_JOB_NOT_FOUND };
    if (job.client !== this.caller) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (!updateTitle || updateTitle.length > 100) return { ok: false, value: ERR_INVALID_JOB_TITLE };
    if (!updateDescription || updateDescription.length > 1000) return { ok: false, value: ERR_INVALID_DESCRIPTION };
    if (updateBudget <= 0) return { ok: false, value: ERR_INVALID_BUDGET };
    if (this.state.jobsByTitle.has(updateTitle) && this.state.jobsByTitle.get(updateTitle) !== jobId) {
      return { ok: false, value: ERR_JOB_ALREADY_EXISTS };
    }
    const updated: Job = {
      ...job,
      title: updateTitle,
      description: updateDescription,
      budget: updateBudget,
      timestamp: this.blockHeight,
    };
    this.state.jobs.set(jobId, updated);
    this.state.jobsByTitle.delete(job.title);
    this.state.jobsByTitle.set(updateTitle, jobId);
    this.state.jobUpdates.set(jobId, {
      updateTitle,
      updateDescription,
      updateBudget,
      updateTimestamp: this.blockHeight,
      updater: this.caller,
    });
    return { ok: true, value: true };
  }

  getJobCount(): Result<number> {
    return { ok: true, value: this.state.nextJobId };
  }

  checkJobExistence(title: string): Result<boolean> {
    return { ok: true, value: this.state.jobsByTitle.has(title) };
  }
}

describe("GigMarketplace", () => {
  let contract: GigMarketplaceMock;

  beforeEach(() => {
    contract = new GigMarketplaceMock();
    contract.reset();
  });

  it("creates a job successfully", () => {
    const result = contract.createJob(
      "Web Dev Project",
      "Build a website",
      1000,
      100,
      3,
      "Development",
      ["HTML", "CSS"],
      "50% upfront",
      2,
      100
    );
    expect(result.ok).toBe(true);
    expect(result.value).toBe(1);
    const job = contract.getJob(1);
    expect(job?.title).toBe("Web Dev Project");
    expect(job?.budget).toBe(1000);
    expect(job?.milestones).toBe(3);
  });

  it("rejects duplicate job titles", () => {
    contract.createJob(
      "Web Dev Project",
      "Build a website",
      1000,
      100,
      3,
      "Development",
      ["HTML", "CSS"],
      "50% upfront",
      2,
      100
    );
    const result = contract.createJob(
      "Web Dev Project",
      "Another site",
      2000,
      200,
      5,
      "Design",
      ["JS"],
      "Full payment",
      3,
      200
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_JOB_ALREADY_EXISTS);
  });

  it("rejects invalid budget", () => {
    const result = contract.createJob(
      "Invalid Budget",
      "Description",
      0,
      100,
      3,
      "Development",
      ["HTML"],
      "Terms",
      2,
      100
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_BUDGET);
  });

  it("hires freelancer successfully", () => {
    contract.createJob(
      "Project",
      "Desc",
      1000,
      100,
      3,
      "Dev",
      ["Skill"],
      "Terms",
      2,
      100
    );
    const result = contract.hireFreelancer(1, "ST2FREELANCER");
    expect(result.ok).toBe(true);
    const job = contract.getJob(1);
    expect(job?.freelancer).toBe("ST2FREELANCER");
    expect(job?.status).toBe(1);
  });

  it("rejects hire by non-client", () => {
    contract.createJob(
      "Project",
      "Desc",
      1000,
      100,
      3,
      "Dev",
      ["Skill"],
      "Terms",
      2,
      100
    );
    contract.caller = "ST3OTHER";
    const result = contract.hireFreelancer(1, "ST2FREELANCER");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NOT_AUTHORIZED);
  });

  it("completes job successfully", () => {
    contract.createJob(
      "Project",
      "Desc",
      1000,
      100,
      3,
      "Dev",
      ["Skill"],
      "Terms",
      2,
      100
    );
    contract.hireFreelancer(1, "ST2FREELANCER");
    const result = contract.completeJob(1);
    expect(result.ok).toBe(true);
    const job = contract.getJob(1);
    expect(job?.status).toBe(2);
  });

  it("rejects complete by unauthorized", () => {
    contract.createJob(
      "Project",
      "Desc",
      1000,
      100,
      3,
      "Dev",
      ["Skill"],
      "Terms",
      2,
      100
    );
    contract.hireFreelancer(1, "ST2FREELANCER");
    contract.caller = "ST3OTHER";
    const result = contract.completeJob(1);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NOT_AUTHORIZED);
  });

  it("updates job successfully", () => {
    contract.createJob(
      "Old Title",
      "Old Desc",
      1000,
      100,
      3,
      "Dev",
      ["Skill"],
      "Terms",
      2,
      100
    );
    const result = contract.updateJob(1, "New Title", "New Desc", 2000);
    expect(result.ok).toBe(true);
    const job = contract.getJob(1);
    expect(job?.title).toBe("New Title");
    expect(job?.description).toBe("New Desc");
    expect(job?.budget).toBe(2000);
  });

  it("rejects update by non-client", () => {
    contract.createJob(
      "Title",
      "Desc",
      1000,
      100,
      3,
      "Dev",
      ["Skill"],
      "Terms",
      2,
      100
    );
    contract.caller = "ST3OTHER";
    const result = contract.updateJob(1, "New Title", "New Desc", 2000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NOT_AUTHORIZED);
  });

  it("returns correct job count", () => {
    contract.createJob(
      "Job1",
      "Desc1",
      1000,
      100,
      3,
      "Dev",
      ["Skill"],
      "Terms",
      2,
      100
    );
    contract.createJob(
      "Job2",
      "Desc2",
      2000,
      200,
      5,
      "Design",
      ["JS"],
      "Full",
      3,
      200
    );
    const result = contract.getJobCount();
    expect(result.ok).toBe(true);
    expect(result.value).toBe(2);
  });

  it("checks job existence correctly", () => {
    contract.createJob(
      "Existing",
      "Desc",
      1000,
      100,
      3,
      "Dev",
      ["Skill"],
      "Terms",
      2,
      100
    );
    const result = contract.checkJobExistence("Existing");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const result2 = contract.checkJobExistence("NonExistent");
    expect(result2.ok).toBe(true);
    expect(result2.value).toBe(false);
  });

  it("rejects job creation with max jobs exceeded", () => {
    contract.state.maxJobs = 1;
    contract.createJob(
      "Job1",
      "Desc1",
      1000,
      100,
      3,
      "Dev",
      ["Skill"],
      "Terms",
      2,
      100
    );
    const result = contract.createJob(
      "Job2",
      "Desc2",
      2000,
      200,
      5,
      "Design",
      ["JS"],
      "Full",
      3,
      200
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_MAX_JOBS_EXCEEDED);
  });

  it("rejects invalid title in create", () => {
    const longTitle = "a".repeat(101);
    const result = contract.createJob(
      longTitle,
      "Desc",
      1000,
      100,
      3,
      "Dev",
      ["Skill"],
      "Terms",
      2,
      100
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_JOB_TITLE);
  });
});