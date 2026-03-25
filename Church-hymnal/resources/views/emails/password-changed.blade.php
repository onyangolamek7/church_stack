<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed – Wende Injili</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #f0ede8;
      padding: 40px 16px;
      color: #2d2d2d;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    }
    .header {
      background: linear-gradient(135deg, #1a3a2a 0%, #2d6a4f 100%);
      padding: 48px 40px 36px;
      text-align: center;
      position: relative;
    }
    .header::after {
      content: '';
      display: block;
      width: 60px;
      height: 3px;
      background: #e8d5a3;
      margin: 20px auto 0;
      border-radius: 2px;
    }
    .header .icon {
      font-size: 40px;
      display: block;
      margin-bottom: 12px;
    }
    .header h1 {
      color: #e8d5a3;
      font-size: 28px;
      font-weight: normal;
      letter-spacing: 2px;
    }
    .header .subtitle {
      color: #95c4a8;
      font-size: 12px;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-top: 8px;
    }
    .body {
      padding: 44px 40px;
    }
    .body h2 {
      color: #1a3a2a;
      font-size: 24px;
      font-weight: normal;
      margin-bottom: 16px;
    }
    .body p {
      color: #555;
      line-height: 1.8;
      font-size: 15px;
      margin-bottom: 16px;
    }
    .alert-card {
      background: #fff8f0;
      border: 1px solid #f5c48a;
      border-left: 4px solid #d97706;
      border-radius: 8px;
      padding: 20px 24px;
      margin: 28px 0;
    }
    .alert-card p {
      color: #7c4a00;
      font-size: 14px;
      margin: 0;
      line-height: 1.7;
    }
    .detail-card {
      background: #f7f9f8;
      border: 1px solid #d4e8dc;
      border-radius: 8px;
      padding: 24px 28px;
      margin: 28px 0;
    }
    .detail-card h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #2d6a4f;
      margin-bottom: 16px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e4ede8;
      font-size: 14px;
    }
    .detail-row:last-child { border-bottom: none; }
    .detail-row .label { color: #888; }
    .detail-row .value { color: #1a3a2a; font-weight: bold; }
    .divider {
      width: 100%;
      height: 1px;
      background: #e8ede9;
      margin: 28px 0;
    }
    .footer {
      background: #f7f9f8;
      border-top: 1px solid #e4ede8;
      padding: 28px 40px;
      text-align: center;
    }
    .footer p {
      color: #999;
      font-size: 12px;
      line-height: 1.7;
    }
    .footer .brand {
      color: #2d6a4f;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header">
      <span class="icon">🔐</span>
      <h1>Wende Injili</h1>
      <p class="subtitle">Israel CA · Church Hymnal</p>
    </div>

    <div class="body">
      <h2>Password Changed, {{ $user->name }}.</h2>
      <p>
        This is a confirmation that the password for your
        <strong>Israel CA Wende Injili</strong> account was successfully changed.
      </p>

      <div class="detail-card">
        <h3>Account Details</h3>
        <div class="detail-row">
          <span class="label">Full Name</span>
          <span class="value">{{ $user->name }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Email Address</span>
          <span class="value">{{ $user->email }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Changed At</span>
          <span class="value">{{ now()->format('d M Y, H:i') }} UTC</span>
        </div>
      </div>

      <div class="alert-card">
        <p>
          ⚠️ <strong>If you did not make this change</strong>, your account may have been
          accessed without your permission. Please contact your church administrator
          immediately and do not share your password with anyone.
        </p>
      </div>

      <div class="divider"></div>

      <p>
        For your security, all other active sessions on your account have been
        signed out. You will need to log in again on any other devices.
      </p>
      <p>May God keep you safe.</p>
      <p style="margin-top: 32px; color: #1a3a2a;">
        In His Service,<br>
        <strong>Israel CA Wende Injili Team</strong>
      </p>
    </div>

    <div class="footer">
      <p class="brand">Israel CA Wende Injili</p>
      <p>
        If you did not request this change, please contact your church administrator immediately.
      </p>
    </div>

  </div>
</body>
</html>
