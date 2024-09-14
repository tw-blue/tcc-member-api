/**
 * Tcc  Member API
 * 1.0.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from "@oazapfts/runtime";
import * as QS from "@oazapfts/runtime/query";
export const defaults: Oazapfts.Defaults<Oazapfts.CustomHeaders> = {
    headers: {},
    baseUrl: "https://localhost:8080/api/v1",
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {
    developmentServer: "https://localhost:8080/api/v1",
    productionServer: "https://tcc-member-db-4bfaysdsja-ew.a.run.app/api/v1"
};
export type Date = string;
export type Member = {
    id?: string;
    vorname?: string;
    nachname?: string;
    geburtsdatum?: Date;
    geburtsort?: string;
    geschlecht?: string;
    passnummer?: string;
    uvertrag?: boolean;
    verein?: boolean;
    graduierung?: string;
    letztePruefung?: Date;
    kontakt?: string;
};
export type Claims = string[];
export type User = {
    displayName?: string;
    customClaims?: Claims;
    email?: string;
    uid?: string;
    emailVerified?: boolean;
};
export type Claim = string;
export type ExamRegistration = {
    memberId?: string;
    clubStatus?: number;
    newKup?: number;
    parentalConsent?: number;
    spellingConfirmation?: number;
    fee?: number;
    feePaid?: boolean;
    vorname?: string;
    nachname?: string;
    geburtsdatum?: Date;
    geburtsort?: string;
    geschlecht?: string;
    passnummer?: string;
    graduierung?: string;
};
export type ExamMember = {
    memberId?: string;
    clubStatus?: number;
    newKup?: number;
    parentalConsent?: number;
    spellingConfirmation?: number;
    fee?: number;
    feePaid?: boolean;
};
/**
 * Check if the API is running
 */
export function getOk(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText("/ok", {
        ...opts
    });
}
/**
 * Check if the user is authenticated
 */
export function getAuth(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText("/auth", {
        ...opts
    });
}
/**
 * Get all Members
 */
export function getMembers(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: Member[];
    } | {
        status: 401;
    }>("/members", {
        ...opts
    });
}
/**
 * Add a new Member
 */
export function postMembers(member?: Member, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText("/members", oazapfts.json({
        ...opts,
        method: "POST",
        body: member
    }));
}
/**
 * Get all Users
 */
export function getUsers(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: User[];
    } | {
        status: 401;
    }>("/users", {
        ...opts
    });
}
/**
 * Update Claim Value for User
 */
export function putClaims(uid: string, claim: Claim, value: boolean, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText(`/claims/${encodeURIComponent(uid)}/${encodeURIComponent(claim)}${QS.query(QS.explode({
        value
    }))}`, {
        ...opts,
        method: "PUT"
    });
}
/**
 * List all Exam Registrations
 */
export function getExamRegistrations(opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchJson<{
        status: 200;
        data: ExamRegistration[];
    } | {
        status: 401;
    }>("/exam/registration", {
        ...opts
    });
}
/**
 * Register a Member for an Exam
 */
export function postExamRegistration(examMember?: ExamMember, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText("/exam/registration", oazapfts.json({
        ...opts,
        method: "POST",
        body: examMember
    }));
}
/**
 * Delete a Member from the Exam Registration
 */
export function deleteExamRegistration(memberId: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.fetchText(`/exam/registration${QS.query(QS.explode({
        memberId
    }))}`, {
        ...opts,
        method: "DELETE"
    });
}
