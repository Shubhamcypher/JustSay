{/* Google */}
<button
onClick={() => handleOAuth("google")}
className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg py-2 text-sm text-white transition"
>
<img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" />
Sign in with Google
</button>

{/* GitHub */}
<button
onClick={() => handleOAuth("github")}
className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg py-2 text-sm text-white transition"
>
<img src="https://www.svgrepo.com/show/512317/github-142.svg" className="w-4 h-4 invert" />
Sign in with GitHub
</button>

{/* Microsoft */}
<button
onClick={() => handleOAuth("microsoft")}
className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg py-2 text-sm text-white transition"
>
<img src="https://www.svgrepo.com/show/448239/microsoft.svg" className="w-4 h-4" />
Sign in with Microsoft
</button>

{/* Phone */}
<button
onClick={() => handlePhoneLogin()}
className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg py-2 text-sm text-white transition"
>
📱 Sign in using Number
</button>