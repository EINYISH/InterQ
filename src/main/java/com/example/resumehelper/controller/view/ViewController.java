package com.example.resumehelper.controller.view;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/")
    public String showIntro() { return "intro"; }

    @GetMapping("/index")
    public String home() { return "index"; }

    @GetMapping("/upload")
    public String upload() { return "upload"; }

    @GetMapping("/simulation")
    public String simulation() { return "simulation"; }

    @GetMapping("/feedback")
    public String feedback() { return "feedback"; }

    @GetMapping("/login")
    public String loginPage() { return "login"; }

    @GetMapping("/signup")
    public String signupPage() { return "signup"; }

    @GetMapping("/signup-success")
    public String signupSuccess() { return "signup-success"; }

    @GetMapping("/settings")
    public String myPage() { return "settings"; }

    @GetMapping("/mypersonal")
    public String myPersonalPage() { return "mypersonal"; }

    @GetMapping("/notice")
    public String noticePage() { return "notice"; }

    @GetMapping("/loading")
    public String loadingPage() { return "loading"; }

    @GetMapping("/review-board")
    public String showReviewBoardPage() { return "review-board"; }

    @GetMapping("/write-review")
    public String writeReviewPage() { return "write-review"; }
}
