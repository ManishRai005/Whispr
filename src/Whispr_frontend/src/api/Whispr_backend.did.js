export const idlFactory = ({ IDL }) => {
    const Coordinates = IDL.Record({ 'lat': IDL.Float64, 'lng': IDL.Float64 });
    const LocationData = IDL.Record({
      'address': IDL.Text,
      'coordinates': IDL.Opt(Coordinates),
    });
    const EvidenceFile = IDL.Record({
      'content': IDL.Vec(IDL.Nat8),
      'name': IDL.Text,
      'size': IDL.Nat64,
      'file_type': IDL.Text,
    });
    const ReportStatus = IDL.Variant({
      'Rejected': IDL.Null,
      'Verified': IDL.Null,
      'Pending': IDL.Null,
    });
    const Report = IDL.Record({
      'id': IDL.Text,
      'title': IDL.Text,
      'reward': IDL.Nat64,
      'has_messages': IDL.Bool,
      'date': IDL.Opt(IDL.Text),
      'time': IDL.Opt(IDL.Text),
      'description': IDL.Text,
      'reporter': IDL.Principal,
      'evidence_files': IDL.Vec(EvidenceFile),
      'status': ReportStatus,
      'created_at': IDL.Nat64,
      'location': LocationData,
      'stake_amount': IDL.Nat64,
      'category': IDL.Text,
    });
    const ReportSubmission = IDL.Record({
      'title': IDL.Text,
      'date': IDL.Opt(IDL.Text),
      'time': IDL.Opt(IDL.Text),
      'description': IDL.Text,
      'evidence_files': IDL.Vec(EvidenceFile),
      'location': LocationData,
      'stake_amount': IDL.Nat64,
      'category': IDL.Text,
    });
    const ReportSummary = IDL.Record({
      'id': IDL.Text,
      'date': IDL.Text,
      'title': IDL.Text,
      'reward': IDL.Nat64,
      'has_messages': IDL.Bool,
      'stake': IDL.Nat64,
      'status': IDL.Text,
      'category': IDL.Text,
    });
    return IDL.Service({
      'get_my_reports': IDL.Func([], [IDL.Vec(ReportSummary)], ['query']),
      'get_report': IDL.Func([IDL.Text], [IDL.Opt(Report)], ['query']),
      'get_token_balance': IDL.Func([], [IDL.Nat64], ['query']),
      'greet': IDL.Func([IDL.Text], [IDL.Text], ['query']),
      'reject_report': IDL.Func([IDL.Text], [IDL.Bool], []),
      'submit_report': IDL.Func([ReportSubmission], [IDL.Text], []),
      'verify_report': IDL.Func([IDL.Text, IDL.Nat64], [IDL.Bool], []),
    });
  };
  export const init = ({ IDL }) => { return []; };